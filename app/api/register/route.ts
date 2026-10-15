import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    // --------------------------------------------------
    // Walidacja
    // --------------------------------------------------

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Wszystkie pola są wymagane.",
        },
        { status: 400 },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          message: "Imię musi mieć co najmniej 2 znaki.",
        },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        {
          message: "Imię może mieć maksymalnie 50 znaków.",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: "Podaj prawidłowy adres e-mail.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Hasło musi mieć co najmniej 8 znaków.",
        },
        { status: 400 },
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        {
          message: "Hasło jest zbyt długie.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Sprawdzenie użytkownika
    // --------------------------------------------------

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Konto z tym adresem e-mail już istnieje.",
        },
        { status: 409 },
      );
    }

    // --------------------------------------------------
    // Hash hasła
    // --------------------------------------------------

    const passwordHash = await bcrypt.hash(password, 12);

    // --------------------------------------------------
    // Utworzenie użytkownika
    // --------------------------------------------------

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: "USER",
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "Konto zostało utworzone.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);

    return NextResponse.json(
      {
        message: "Wystąpił błąd podczas tworzenia konta.",
      },
      { status: 500 },
    );
  }
}
