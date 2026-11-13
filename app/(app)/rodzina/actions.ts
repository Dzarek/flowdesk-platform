"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

type ActionResult = {
  success: boolean;
  error?: string;
};

type MemberInput = {
  name: string;
  email?: string;
  roleDescription?: string;
  color?: string;
};

async function getFamilyContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

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

  if (!user?.familyId || !user.familyMember) {
    return null;
  }

  return {
    userId: user.id,
    familyId: user.familyId,
    memberId: user.familyMember.id,
    role: user.familyMember.role,
  };
}

function validateMemberInput(input: MemberInput) {
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase() || null;
  const roleDescription = input.roleDescription?.trim() || null;

  if (name.length < 2 || name.length > 60) {
    return { error: "Imię musi mieć od 2 do 60 znaków." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Podaj prawidłowy adres e-mail." };
  }

  if (roleDescription && roleDescription.length > 150) {
    return { error: "Opis może mieć maksymalnie 150 znaków." };
  }

  const color = input.color?.trim() || "#E4EBD5";

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: "Nieprawidłowy kolor profilu." };
  }

  return {
    data: {
      name,
      email,
      roleDescription,
      color,
    },
  };
}

// Dodawanie dziecka
export async function createChild(input: MemberInput): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    if (context.role !== "HEAD") {
      return {
        success: false,
        error: "Nie masz uprawnień do dodawania członków.",
      };
    }

    const validation = validateMemberInput(input);

    if (!validation.data) {
      return { success: false, error: validation.error };
    }

    const { name, email, roleDescription, color } = validation.data;

    if (email) {
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId: context.familyId,
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (existingMember) {
        return {
          success: false,
          error: "Członek rodziny z takim adresem e-mail już istnieje.",
        };
      }

      const existingInvitation = await prisma.familyInvitation.findFirst({
        where: {
          familyId: context.familyId,
          email: {
            equals: email,
            mode: "insensitive",
          },
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });

      if (existingInvitation) {
        return {
          success: false,
          error: "Dla tego adresu istnieje już oczekujące zaproszenie.",
        };
      }
    }

    await prisma.familyMember.create({
      data: {
        name,
        email,
        role: "CHILD",
        roleDescription,
        color,
        familyId: context.familyId,
      },
    });

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("createChild error:", error);

    return {
      success: false,
      error: "Nie udało się dodać dziecka.",
    };
  }
}

// Edycja profilu
export async function updateFamilyMember(
  memberId: string,
  input: MemberInput,
): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: context.familyId,
      },
      select: {
        id: true,
        role: true,
        userId: true,
      },
    });

    if (!member) {
      return { success: false, error: "Nie znaleziono członka rodziny." };
    }

    const isHead = context.role === "HEAD";
    const isOwnProfile = member.id === context.memberId;

    if (!isHead && !isOwnProfile) {
      return {
        success: false,
        error: "Nie masz uprawnień do edycji tego profilu.",
      };
    }

    if (member.role === "HEAD" && !isHead) {
      return {
        success: false,
        error: "Nie możesz edytować profilu głowy rodziny.",
      };
    }

    const validation = validateMemberInput(input);

    if (!validation.data) {
      return { success: false, error: validation.error };
    }

    const { name, email, roleDescription, color } = validation.data;

    if (email) {
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId: context.familyId,
          id: { not: memberId },
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (existingMember) {
        return {
          success: false,
          error: "Inny członek rodziny używa już tego adresu e-mail.",
        };
      }
    }

    await prisma.familyMember.update({
      where: { id: memberId },
      data: {
        name,
        email,
        roleDescription,
        color,
      },
    });

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("updateFamilyMember error:", error);

    return {
      success: false,
      error: "Nie udało się zaktualizować profilu.",
    };
  }
}

// Usuwanie profilu dziecka
export async function deleteChild(memberId: string): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    if (context.role !== "HEAD") {
      return {
        success: false,
        error: "Nie masz uprawnień do usuwania członków.",
      };
    }

    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: context.familyId,
      },
      select: {
        id: true,
        role: true,
        userId: true,
      },
    });

    if (!member) {
      return { success: false, error: "Nie znaleziono członka rodziny." };
    }

    if (member.role !== "CHILD") {
      return {
        success: false,
        error: "Ta akcja służy wyłącznie do usuwania profili dzieci.",
      };
    }

    if (member.userId) {
      return {
        success: false,
        error:
          "Ten profil ma przypisane konto użytkownika. Użyj procedury usuwania konta.",
      };
    }

    await prisma.familyMember.delete({
      where: { id: member.id },
    });

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("deleteChild error:", error);

    return {
      success: false,
      error: "Nie udało się usunąć profilu dziecka.",
    };
  }
}
