import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import FamilyPageContent from "@/components/family/FamilyPageContent";

export default async function FamilyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      familyId: true,
    },
  });

  if (!user?.familyId) {
    redirect("/utworz-rodzine");
  }

  const members = await prisma.familyMember.findMany({
    where: {
      familyId: user.familyId,
    },
    orderBy: {
      joinedAt: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      roleDescription: true,
      imageUrl: true,
      color: true,
      joinedAt: true,
      userId: true,
    },
  });

  const initialMembers = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    roleDescription: member.roleDescription,
    img: member.imageUrl,
    color: member.color,
    joinedAt: member.joinedAt.toISOString().slice(0, 10),
    isCurrentUser: member.userId === user.id,
  }));

  return <FamilyPageContent initialMembers={initialMembers} />;
}
