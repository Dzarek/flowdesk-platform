import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "USER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "STAFF" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "STAFF" | "USER";
  }
}
