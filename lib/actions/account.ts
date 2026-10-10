"use server";

import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/password-reset";

export async function updateUserName(name: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Nie jesteś zalogowany.");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Nazwa użytkownika jest wymagana.");
  }

  if (trimmedName.length < 2) {
    throw new Error("Nazwa użytkownika musi mieć co najmniej 2 znaki.");
  }

  if (trimmedName.length > 50) {
    throw new Error("Nazwa użytkownika może mieć maksymalnie 50 znaków.");
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: trimmedName,
    },
  });

  return {
    success: true,
  };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Nie jesteś zalogowany.");
  }

  if (!currentPassword) {
    throw new Error("Podaj aktualne hasło.");
  }

  if (!newPassword) {
    throw new Error("Podaj nowe hasło.");
  }

  if (newPassword.length < 8) {
    throw new Error("Nowe hasło musi mieć co najmniej 8 znaków.");
  }

  if (newPassword.length > 100) {
    throw new Error("Nowe hasło jest zbyt długie.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Nowe hasła nie są takie same.");
  }

  if (currentPassword === newPassword) {
    throw new Error("Nowe hasło musi różnić się od aktualnego.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      password: true,
    },
  });

  if (!user) {
    throw new Error("Nie znaleziono użytkownika.");
  }

  const passwordCorrect = await bcrypt.compare(currentPassword, user.password!);

  if (!passwordCorrect) {
    throw new Error("Aktualne hasło jest nieprawidłowe.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    success: true,
  };
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Podaj adres e-mail.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  /*
   * Nie informujemy użytkownika,
   * czy podany adres istnieje.
   */
  if (!user) {
    return {
      success: true,
    };
  }

  /*
   * Usuwamy wcześniejsze tokeny.
   */
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  /*
   * Generujemy nowy token.
   */
  const token = generatePasswordResetToken();

  /*
   * W bazie zapisujemy tylko hash tokenu.
   */
  const tokenHash = hashPasswordResetToken(token);

  await prisma.passwordResetToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Brak konfiguracji NEXT_PUBLIC_APP_URL.");
  }

  const resetUrl = `${appUrl}/reset-hasla?token=${token}`;

  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl,
  });

  return {
    success: true,
  };
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
) {
  if (!token) {
    throw new Error("Nieprawidłowy link resetowania hasła.");
  }

  if (!newPassword) {
    throw new Error("Podaj nowe hasło.");
  }

  if (newPassword.length < 8) {
    throw new Error("Nowe hasło musi mieć co najmniej 8 znaków.");
  }

  if (newPassword.length > 100) {
    throw new Error("Nowe hasło jest zbyt długie.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Nowe hasła nie są takie same.");
  }

  const tokenHash = hashPasswordResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: tokenHash,
    },
  });

  if (!resetToken) {
    throw new Error("Link resetowania hasła jest nieprawidłowy lub wygasł.");
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    throw new Error("Link resetowania hasła wygasł.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: resetToken.userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  /*
   * Token jest jednorazowy.
   */
  await prisma.passwordResetToken.delete({
    where: {
      id: resetToken.id,
    },
  });

  return {
    success: true,
  };
}
