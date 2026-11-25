"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { ContactCategory as PrismaContactCategory } from "@prisma/client";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import type {
  ContactCategory,
  ContactInput,
  FamilyContact,
} from "@/lib/contacts/types";

type ContactActionResult =
  | {
      success: true;
      contact?: FamilyContact;
    }
  | {
      success: false;
      error: string;
    };

const categoryToDb: Record<ContactCategory, PrismaContactCategory> = {
  Zdrowie: "HEALTH",
  Motoryzacja: "AUTOMOTIVE",
  Dom: "HOME",
  "Szkoła i dzieci": "SCHOOL",
  Zwierzęta: "PETS",
  Inne: "OTHER",
};

const categoryFromDb: Record<PrismaContactCategory, ContactCategory> = {
  HEALTH: "Zdrowie",
  AUTOMOTIVE: "Motoryzacja",
  HOME: "Dom",
  SCHOOL: "Szkoła i dzieci",
  PETS: "Zwierzęta",
  OTHER: "Inne",
};

async function getFamilyContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      familyId: true,
      familyMember: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!user?.familyId || !user.familyMember) return null;

  return {
    userId: user.id,
    familyId: user.familyId,
    memberId: user.familyMember.id,
    role: user.familyMember.role,
  };
}

function validateContact(input: ContactInput) {
  if (!input || typeof input !== "object") {
    return { error: "Nieprawidłowe dane kontaktu." };
  }

  const name = String(input.name ?? "").trim();
  const category = input.category;
  const phone = String(input.phone ?? "").trim();
  const email = String(input.email ?? "").trim();
  const address = String(input.address ?? "").trim();
  const notes = String(input.notes ?? "").trim();

  if (name.length < 2 || name.length > 100) {
    return { error: "Nazwa kontaktu musi mieć od 2 do 100 znaków." };
  }

  if (typeof category !== "string" || !Object.hasOwn(categoryToDb, category)) {
    return { error: "Wybierz prawidłową kategorię." };
  }

  if (phone.length > 40) {
    return { error: "Numer telefonu jest zbyt długi." };
  }

  if (email.length > 254) {
    return { error: "Adres e-mail jest zbyt długi." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Podaj prawidłowy adres e-mail." };
  }

  if (address.length > 250) {
    return { error: "Adres może mieć maksymalnie 250 znaków." };
  }

  if (notes.length > 1000) {
    return { error: "Notatki mogą mieć maksymalnie 1000 znaków." };
  }

  return {
    data: {
      name,
      category: categoryToDb[category as ContactCategory],
      phone: phone || null,
      email: email || null,
      address: address || null,
      notes: notes || null,
      favorite: Boolean(input.favorite),
    },
  };
}

async function requireAdult() {
  const context = await getFamilyContext();

  if (!context) {
    return {
      success: false as const,
      error: "Nie znaleziono członkostwa w rodzinie.",
    };
  }

  if (context.role === "CHILD") {
    return {
      success: false as const,
      error: "Nie masz uprawnień do zarządzania kontaktami.",
    };
  }

  return {
    success: true as const,
    context,
  };
}

function mapContact(contact: {
  id: string;
  name: string;
  category: PrismaContactCategory;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  favorite: boolean;
}): FamilyContact {
  return {
    id: contact.id,
    name: contact.name,
    category: categoryFromDb[contact.category],
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    address: contact.address ?? "",
    notes: contact.notes ?? "",
    favorite: contact.favorite,
  };
}

// Dodawanie kontaktu
export async function createContact(
  input: ContactInput,
): Promise<ContactActionResult> {
  try {
    const auth = await requireAdult();

    if (!auth.success) return auth;

    const validation = validateContact(input);

    if (!validation.data) {
      return {
        success: false,
        error: validation.error ?? "Nieprawidłowe dane kontaktu.",
      };
    }

    const contact = await prisma.familyContact.create({
      data: {
        ...validation.data,
        familyId: auth.context.familyId,
      },
    });

    revalidatePath("/kontakty");

    return {
      success: true,
      contact: mapContact(contact),
    };
  } catch (error) {
    console.error("createContact error:", error);

    return {
      success: false,
      error: "Nie udało się dodać kontaktu.",
    };
  }
}

// Edycja kontaktu
export async function updateContact(
  contactId: string,
  input: ContactInput,
): Promise<ContactActionResult> {
  try {
    const auth = await requireAdult();

    if (!auth.success) return auth;

    if (!contactId || typeof contactId !== "string") {
      return {
        success: false,
        error: "Nieprawidłowy identyfikator kontaktu.",
      };
    }

    const validation = validateContact(input);

    if (!validation.data) {
      return {
        success: false,
        error: validation.error ?? "Nieprawidłowe dane kontaktu.",
      };
    }

    const result = await prisma.familyContact.updateMany({
      where: {
        id: contactId,
        familyId: auth.context.familyId,
      },
      data: validation.data,
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Nie znaleziono kontaktu.",
      };
    }

    revalidatePath("/kontakty");

    return { success: true };
  } catch (error) {
    console.error("updateContact error:", error);

    return {
      success: false,
      error: "Nie udało się zaktualizować kontaktu.",
    };
  }
}

// Usuwanie kontaktu
export async function deleteContact(
  contactId: string,
): Promise<ContactActionResult> {
  try {
    const auth = await requireAdult();

    if (!auth.success) return auth;

    if (!contactId || typeof contactId !== "string") {
      return {
        success: false,
        error: "Nieprawidłowy identyfikator kontaktu.",
      };
    }

    const result = await prisma.familyContact.deleteMany({
      where: {
        id: contactId,
        familyId: auth.context.familyId,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Nie znaleziono kontaktu.",
      };
    }

    revalidatePath("/kontakty");

    return { success: true };
  } catch (error) {
    console.error("deleteContact error:", error);

    return {
      success: false,
      error: "Nie udało się usunąć kontaktu.",
    };
  }
}

// Zmiana statusu ulubionego
export async function toggleContactFavorite(
  contactId: string,
): Promise<ContactActionResult> {
  try {
    const auth = await requireAdult();

    if (!auth.success) return auth;

    if (!contactId || typeof contactId !== "string") {
      return {
        success: false,
        error: "Nieprawidłowy identyfikator kontaktu.",
      };
    }

    const contact = await prisma.familyContact.findFirst({
      where: {
        id: contactId,
        familyId: auth.context.familyId,
      },
      select: {
        id: true,
        favorite: true,
      },
    });

    if (!contact) {
      return {
        success: false,
        error: "Nie znaleziono kontaktu.",
      };
    }

    await prisma.familyContact.updateMany({
      where: {
        id: contact.id,
        familyId: auth.context.familyId,
      },
      data: {
        favorite: !contact.favorite,
      },
    });

    revalidatePath("/kontakty");

    return { success: true };
  } catch (error) {
    console.error("toggleContactFavorite error:", error);

    return {
      success: false,
      error: "Nie udało się zmienić ulubionego kontaktu.",
    };
  }
}
