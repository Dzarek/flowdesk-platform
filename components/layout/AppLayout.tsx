import { ReactNode } from "react";
import AppLayoutClient from "./AppLayoutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      role: true,
      email: true,
    },
  });
  if (!user) {
    redirect("/");
  }

  return (
    <AppLayoutClient
      role={session.user.role}
      userName={user.name ?? "Użytkownik"}
      activePromotions={[]}
    >
      {children}
    </AppLayoutClient>
  );
}
