"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export type CreateFamilyState = {
  error?: string;
};

export async function createFamily(
  _prevState: CreateFamilyState,
  formData: FormData,
): Promise<CreateFamilyState> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Musisz być zalogowany, aby utworzyć rodzinę." };
  }

  const familyName = formData.get("name");

  if (typeof familyName !== "string") {
    return { error: "Podaj nazwę rodziny." };
  }

  const name = familyName.trim();

  if (name.length < 2) {
    return { error: "Nazwa rodziny musi mieć co najmniej 2 znaki." };
  }

  if (name.length > 60) {
    return { error: "Nazwa rodziny może mieć maksymalnie 60 znaków." };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            familyId: true,
          },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        if (user.familyId) {
          throw new Error("ALREADY_IN_FAMILY");
        }

        // 1. Tworzymy rodzinę.
        const family = await tx.family.create({
          data: {
            name,
          },
        });

        // 2. Przypisujemy rodzinę do konta.
        // Warunek familyId: null zabezpiecza przed równoczesnym
        // przypisaniem użytkownika do innej rodziny.
        const updatedUser = await tx.user.updateMany({
          where: {
            id: user.id,
            familyId: null,
          },
          data: {
            familyId: family.id,
          },
        });

        if (updatedUser.count !== 1) {
          throw new Error("ALREADY_IN_FAMILY");
        }

        // 3. Tworzymy profil rodzinny właściciela.
        await tx.familyMember.create({
          data: {
            name: user.name,
            email: user.email,
            role: "HEAD",
            familyId: family.id,
            userId: user.id,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ALREADY_IN_FAMILY") {
        return {
          error: "Należysz już do rodziny. Odśwież stronę.",
        };
      }

      if (error.message === "USER_NOT_FOUND") {
        return {
          error: "Nie znaleziono Twojego konta.",
        };
      }
    }

    console.error("Błąd tworzenia rodziny:", error);

    return {
      error: "Nie udało się utworzyć rodziny. Spróbuj ponownie.",
    };
  }

  redirect("/dashboard");
}
