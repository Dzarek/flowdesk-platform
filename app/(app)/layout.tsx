import { redirect } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import { getFamilyContext } from "@/lib/auth/get-family-context";

export default async function AppLayoutGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getFamilyContext();

  if (!context.authenticated) {
    redirect("/");
  }

  if (!context.hasFamily) {
    redirect("/utworz-rodzine");
  }

  return <AppLayout>{children}</AppLayout>;
}
