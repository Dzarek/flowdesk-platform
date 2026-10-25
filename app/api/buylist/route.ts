import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type ProductCategory = "spożywcze" | "chemia" | "inne";

const categories: ProductCategory[] = ["spożywcze", "chemia", "inne"];

async function getFamilyProductsRef() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Brak autoryzacji.", status: 401 as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      familyId: true,
      family: {
        select: { buylistFirebaseUid: true },
      },
    },
  });

  if (!user?.familyId || !user.family?.buylistFirebaseUid) {
    return {
      error: "Rodzina nie ma skonfigurowanej listy zakupów.",
      status: 400 as const,
    };
  }

  const ref = adminDb
    .collection("users")
    .doc(user.family.buylistFirebaseUid)
    .collection("products");

  return { ref };
}

export async function GET() {
  try {
    const result = await getFamilyProductsRef();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const snapshot = await result.ref.get();

    const products = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
          createdAt: Number(data.createdAt ?? 0),
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Błąd pobierania zakupów:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać listy zakupów." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await getFamilyProductsRef();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = categories.includes(body.category)
      ? (body.category as ProductCategory)
      : "inne";

    if (!name || name.length > 120) {
      return NextResponse.json(
        { error: "Podaj nazwę produktu (maksymalnie 120 znaków)." },
        { status: 400 },
      );
    }

    const doc = await result.ref.add({
      name: name.toLowerCase(),
      category,
      completed: false,
      createdAt: Date.now(),
    });

    return NextResponse.json(
      {
        product: {
          id: doc.id,
          name: name.toLowerCase(),
          category,
          completed: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Błąd dodawania produktu:", error);
    return NextResponse.json(
      { error: "Nie udało się dodać produktu." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await getFamilyProductsRef();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";

    if (!id || typeof body.completed !== "boolean") {
      return NextResponse.json(
        { error: "Nieprawidłowe dane produktu." },
        { status: 400 },
      );
    }

    const productRef = result.ref.doc(id);
    const product = await productRef.get();

    if (!product.exists) {
      return NextResponse.json(
        { error: "Produkt nie istnieje." },
        { status: 404 },
      );
    }

    await productRef.update({ completed: body.completed });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd aktualizacji produktu:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować produktu." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await getFamilyProductsRef();

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clear = searchParams.get("clear") === "true";

    if (id) {
      const productRef = result.ref.doc(id);
      const product = await productRef.get();

      if (!product.exists) {
        return NextResponse.json(
          { error: "Produkt nie istnieje." },
          { status: 404 },
        );
      }

      await productRef.delete();
      return NextResponse.json({ success: true });
    }

    if (clear) {
      const snapshot = await result.ref.get();

      // Firestore pozwala na maksymalnie 500 operacji w jednym batchu.
      for (let i = 0; i < snapshot.docs.length; i += 500) {
        const batch = adminDb.batch();
        snapshot.docs.slice(i, i + 500).forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Podaj ID produktu albo parametr clear=true." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Błąd usuwania produktów:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć produktów." },
      { status: 500 },
    );
  }
}
