import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function getFamilyContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authenticated: false as const,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      familyId: true,
      familyMember: {
        select: {
          id: true,
          name: true,
          role: true,
          familyId: true,
        },
      },
    },
  });

  if (!user) {
    return {
      authenticated: false as const,
    };
  }

  if (
    !user.familyId ||
    !user.familyMember ||
    user.familyMember.familyId !== user.familyId
  ) {
    return {
      authenticated: true as const,
      hasFamily: false as const,
    };
  }

  return {
    authenticated: true as const,
    hasFamily: true as const,
    userId: user.id,
    userName: user.name,
    email: user.email,
    userRole: user.role,
    familyId: user.familyId,
    memberId: user.familyMember.id,
    memberName: user.familyMember.name,
    memberRole: user.familyMember.role,
  };
}
