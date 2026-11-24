import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Hasło",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Błąd podczas autoryzacji:", error);

          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Pierwsze logowanie
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.invalidated = false;

        return token;
      }

      // Brak identyfikatora w tokenie
      if (typeof token.id !== "string") {
        token.invalidated = true;
        return token;
      }

      // Weryfikacja, czy konto nadal istnieje
      const dbUser = await prisma.user.findUnique({
        where: {
          id: token.id,
        },
        select: {
          id: true,
          role: true,
        },
      });

      if (!dbUser) {
        token.invalidated = true;
        return token;
      }

      token.invalidated = false;
      token.role = dbUser.role;

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.invalidated || typeof token.id !== "string") {
          // Sesja istnieje technicznie, ale konto już nie.
          session.user.id = "";
        } else {
          session.user.id = token.id;
          session.user.role = token.role as "USER" | "ADMIN";
        }
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
