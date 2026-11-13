"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

type InvitationActionResult = {
  success: boolean;
  error?: string;
  email?: string;
};

function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function validateToken(token: string) {
  return /^[a-f0-9]{64}$/i.test(token);
}

function getInvitationHash(token: string) {
  if (!validateToken(token)) return null;
  return hashInvitationToken(token);
}

// Rejestracja nowego użytkownika i akceptacja zaproszenia.
export async function registerAndAcceptInvitation(
  token: string,
  nameInput: string,
  password: string,
  confirmPassword: string,
): Promise<InvitationActionResult> {
  try {
    if (!validateToken(token)) {
      return { success: false, error: "Nieprawidłowy link zaproszenia." };
    }

    const name = nameInput.trim();

    if (name.length < 2 || name.length > 100) {
      return {
        success: false,
        error: "Imię i nazwisko musi mieć od 2 do 100 znaków.",
      };
    }

    if (password.length < 8 || password.length > 72) {
      return {
        success: false,
        error: "Hasło musi mieć od 8 do 72 znaków.",
      };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Podane hasła nie są identyczne." };
    }

    const tokenHash = getInvitationHash(token);

    if (!tokenHash) {
      return { success: false, error: "Nieprawidłowy link zaproszenia." };
    }

    const now = new Date();

    const invitation = await prisma.familyInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        email: true,
        familyId: true,
        status: true,
        expiresAt: true,
      },
    });

    if (
      !invitation ||
      invitation.status !== "PENDING" ||
      invitation.expiresAt <= now
    ) {
      return {
        success: false,
        error: "Zaproszenie jest nieaktualne lub wygasło.",
      };
    }

    const email = invitation.email.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error:
          "Konto z tym adresem już istnieje. Zaloguj się, aby zaakceptować zaproszenie.",
        email,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(
      async (tx) => {
        // Warunkowa zmiana statusu chroni przed równoczesną akceptacją.
        const accepted = await tx.familyInvitation.updateMany({
          where: {
            id: invitation.id,
            tokenHash,
            status: "PENDING",
            expiresAt: { gt: new Date() },
          },
          data: {
            status: "ACCEPTED",
            acceptedAt: new Date(),
          },
        });

        if (accepted.count !== 1) {
          throw new Error("INVITATION_NOT_AVAILABLE");
        }

        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "USER",
            familyId: invitation.familyId,
          },
        });

        await tx.familyMember.create({
          data: {
            name,
            email,
            role: "ADULT",
            familyId: invitation.familyId,
            userId: user.id,
          },
        });
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return {
      success: true,
      email,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVITATION_NOT_AVAILABLE"
    ) {
      return {
        success: false,
        error: "Zaproszenie zostało już wykorzystane lub straciło ważność.",
      };
    }

    console.error("registerAndAcceptInvitation error:", error);

    return {
      success: false,
      error: "Nie udało się utworzyć konta i zaakceptować zaproszenia.",
    };
  }
}

// Akceptacja zaproszenia przez istniejące, zalogowane konto.
export async function acceptInvitation(
  token: string,
): Promise<InvitationActionResult> {
  try {
    if (!validateToken(token)) {
      return { success: false, error: "Nieprawidłowy link zaproszenia." };
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Zaloguj się, aby zaakceptować zaproszenie.",
      };
    }

    const tokenHash = getInvitationHash(token);

    if (!tokenHash) {
      return { success: false, error: "Nieprawidłowy link zaproszenia." };
    }

    const now = new Date();

    await prisma.$transaction(
      async (tx) => {
        const invitation = await tx.familyInvitation.findUnique({
          where: { tokenHash },
          select: {
            id: true,
            email: true,
            familyId: true,
            status: true,
            expiresAt: true,
          },
        });

        if (
          !invitation ||
          invitation.status !== "PENDING" ||
          invitation.expiresAt <= now
        ) {
          throw new Error("INVITATION_NOT_AVAILABLE");
        }

        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            familyId: true,
            familyMember: {
              select: { id: true },
            },
          },
        });

        if (!user || !user.email) {
          throw new Error("USER_NOT_FOUND");
        }

        if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
          throw new Error("EMAIL_MISMATCH");
        }

        if (user.familyId || user.familyMember) {
          throw new Error("USER_ALREADY_IN_FAMILY");
        }

        const accepted = await tx.familyInvitation.updateMany({
          where: {
            id: invitation.id,
            tokenHash,
            status: "PENDING",
            expiresAt: { gt: new Date() },
          },
          data: {
            status: "ACCEPTED",
            acceptedAt: new Date(),
          },
        });

        if (accepted.count !== 1) {
          throw new Error("INVITATION_NOT_AVAILABLE");
        }

        const updatedUser = await tx.user.updateMany({
          where: {
            id: user.id,
            familyId: null,
          },
          data: {
            familyId: invitation.familyId,
          },
        });

        if (updatedUser.count !== 1) {
          throw new Error("USER_ALREADY_IN_FAMILY");
        }

        await tx.familyMember.create({
          data: {
            name: user.name,
            email: invitation.email,
            role: "ADULT",
            familyId: invitation.familyId,
            userId: user.id,
          },
        });
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        INVITATION_NOT_AVAILABLE:
          "Zaproszenie zostało już wykorzystane lub straciło ważność.",
        USER_NOT_FOUND: "Nie znaleziono konta użytkownika.",
        EMAIL_MISMATCH:
          "Zalogowane konto ma inny adres e-mail niż adres zaproszenia.",
        USER_ALREADY_IN_FAMILY: "To konto jest już przypisane do rodziny.",
      };

      if (messages[error.message]) {
        return {
          success: false,
          error: messages[error.message],
        };
      }
    }

    console.error("acceptInvitation error:", error);

    return {
      success: false,
      error: "Nie udało się zaakceptować zaproszenia.",
    };
  }
}
