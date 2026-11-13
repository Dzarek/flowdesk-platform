import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import AppLayoutClient from "./AppLayoutClient";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      role: true,
      familyId: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  // Administrator systemowy nie musi należeć do rodziny.
  if (user.role !== "ADMIN" && !user.familyId) {
    redirect("/utworz-rodzine");
  }

  return (
    <AppLayoutClient role={user.role} userName={user.name}>
      {children}
    </AppLayoutClient>
  );
}
