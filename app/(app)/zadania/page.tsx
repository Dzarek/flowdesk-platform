import { redirect } from "next/navigation";

import TasksPageContent from "@/components/tasks/TasksPageContent";
import { getFamilyContext } from "@/lib/auth/get-family-context";
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const context = await getFamilyContext();

  if (!context.authenticated) {
    redirect("/");
  }

  if (!context.hasFamily) {
    redirect("/utworz-rodzine");
  }

  const [tasks, members] = await Promise.all([
    prisma.task.findMany({
      where: {
        familyId: context.familyId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            color: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [
        { completed: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    }),

    prisma.familyMember.findMany({
      where: {
        familyId: context.familyId,
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
      },
    }),
  ]);

  const initialTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
    assigneeId: task.assigneeId,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
  }));

  const initialMembers = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    roleDescription: member.roleDescription,
    img: member.imageUrl,
    color: member.color,
    joinedAt: member.joinedAt.toISOString().slice(0, 10),
  }));

  return (
    <TasksPageContent
      initialTasks={initialTasks}
      initialMembers={initialMembers}
      currentMemberId={context.memberId}
      canManageTasks={
        context.memberRole === "HEAD" || context.memberRole === "ADULT"
      }
    />
  );
}
