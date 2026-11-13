"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";

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

export async function deleteFamilyMember(memberId: string) {
  const context = await getFamilyContext();

  if (!context || context.role !== "HEAD") {
    return {
      success: false,
      message: "Nie masz uprawnień do usunięcia członka rodziny.",
    };
  }

  if (!memberId) {
    return {
      success: false,
      message: "Nieprawidłowy identyfikator członka rodziny.",
    };
  }

  try {
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
      return {
        success: false,
        message: "Nie znaleziono członka rodziny.",
      };
    }

    if (member.role === "HEAD") {
      return {
        success: false,
        message: "Nie można usunąć głowy rodziny.",
      };
    }

    if (member.id === context.memberId) {
      return {
        success: false,
        message: "Nie możesz usunąć własnego profilu.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (member.userId) {
        await tx.user.delete({
          where: {
            id: member.userId,
          },
        });
      } else {
        await tx.familyMember.delete({
          where: {
            id: member.id,
          },
        });
      }
    });

    return {
      success: true,
      message: member.userId
        ? "Konto i profil członka rodziny zostały usunięte."
        : "Profil członka rodziny został usunięty.",
    };
  } catch (error) {
    console.error("Błąd podczas usuwania członka rodziny:", error);

    return {
      success: false,
      message: "Nie udało się usunąć członka rodziny.",
    };
  }
}

type InvitationResult = {
  success: boolean;
  error?: string;
  invitationUrl?: string;
};

export async function createFamilyInvitation(
  emailInput: string,
): Promise<InvitationResult> {
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
        error: "Tylko głowa rodziny może zapraszać nowych członków.",
      };
    }

    const email = emailInput.trim().toLowerCase();

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: "Podaj prawidłowy adres e-mail.",
      };
    }

    // Sprawdzenie istniejącego profilu w tej rodzinie.
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
        error: "Ta osoba jest już członkiem rodziny.",
      };
    }

    // Sprawdzenie, czy konto nie należy już do innej rodziny.
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        familyId: true,
      },
    });

    if (existingUser?.familyId) {
      return {
        success: false,
        error:
          existingUser.familyId === context.familyId
            ? "To konto należy już do tej rodziny."
            : "To konto jest już przypisane do innej rodziny.",
      };
    }

    const now = new Date();

    // Oznaczamy nieaktualne zaproszenia jako wygasłe.
    await prisma.familyInvitation.updateMany({
      where: {
        familyId: context.familyId,
        email: {
          equals: email,
          mode: "insensitive",
        },
        status: "PENDING",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // Sprawdzamy, czy istnieje aktywne zaproszenie.
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId: context.familyId,
        email: {
          equals: email,
          mode: "insensitive",
        },
        status: "PENDING",
        expiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "Dla tego adresu istnieje już aktywne zaproszenie.",
      };
    }

    // Generujemy kryptograficznie bezpieczny token.
    const token = randomBytes(32).toString("hex");

    // W bazie przechowujemy wyłącznie hash tokenu.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await prisma.familyInvitation.create({
      data: {
        email,
        tokenHash,
        familyId: context.familyId,
        invitedByUserId: context.userId,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL;

    if (!baseUrl) {
      throw new Error("Brak konfiguracji NEXTAUTH_URL.");
    }

    const invitationUrl = new URL(`/zaproszenie/${token}`, baseUrl).toString();

    revalidatePath("/rodzina");

    return {
      success: true,
      invitationUrl,
    };
  } catch (error) {
    console.error("createFamilyInvitation error:", error);

    return {
      success: false,
      error: "Nie udało się utworzyć zaproszenia.",
    };
  }
}

export async function revokeFamilyInvitation(
  invitationId: string,
): Promise<ActionResult> {
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
        error: "Tylko głowa rodziny może anulować zaproszenia.",
      };
    }

    const invitation = await prisma.familyInvitation.findFirst({
      where: {
        id: invitationId,
        familyId: context.familyId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Zaproszenie nie istnieje lub nie jest już aktywne.",
      };
    }

    await prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("revokeFamilyInvitation error:", error);

    return {
      success: false,
      error: "Nie udało się anulować zaproszenia.",
    };
  }
}

export async function transferFamilyHead(newHeadMemberId: string) {
  const context = await getFamilyContext();

  if (!context || context.role !== "HEAD") {
    return {
      success: false,
      message: "Tylko głowa rodziny może przekazać tę rolę.",
    };
  }

  if (!newHeadMemberId || newHeadMemberId === context.memberId) {
    return {
      success: false,
      message: "Wybierz innego dorosłego członka rodziny.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const newHead = await tx.familyMember.findFirst({
        where: {
          id: newHeadMemberId,
          familyId: context.familyId,
          role: "ADULT",
        },
        select: {
          id: true,
        },
      });

      if (!newHead) {
        throw new Error("INVALID_TARGET");
      }

      // Najpierw zdejmujemy rolę HEAD z obecnego administratora.
      const currentHead = await tx.familyMember.updateMany({
        where: {
          id: context.memberId,
          familyId: context.familyId,
          role: "HEAD",
        },
        data: {
          role: "ADULT",
        },
      });

      if (currentHead.count !== 1) {
        throw new Error("CURRENT_HEAD_NOT_FOUND");
      }

      // Następnie przekazujemy rolę wybranemu dorosłemu.
      const updatedNewHead = await tx.familyMember.updateMany({
        where: {
          id: newHead.id,
          familyId: context.familyId,
          role: "ADULT",
        },
        data: {
          role: "HEAD",
        },
      });

      if (updatedNewHead.count !== 1) {
        throw new Error("TARGET_UPDATE_FAILED");
      }
    });

    return {
      success: true,
      message: "Rola głowy rodziny została przekazana.",
    };
  } catch (error) {
    console.error("Błąd podczas przekazywania roli HEAD:", error);

    return {
      success: false,
      message:
        error instanceof Error && error.message === "INVALID_TARGET"
          ? "Wybrany członek rodziny nie jest dorosłym lub nie należy do tej rodziny."
          : "Nie udało się przekazać roli głowy rodziny.",
    };
  }
}
