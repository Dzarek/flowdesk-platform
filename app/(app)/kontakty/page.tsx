import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import ContactsPageContent from "@/components/contacts/ContactsPageContent";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

import type { FamilyContact } from "@/lib/contacts/types";

const categoryFromDb = {
  HEALTH: "Zdrowie",
  AUTOMOTIVE: "Motoryzacja",
  HOME: "Dom",
  SCHOOL: "Szkoła i dzieci",
  PETS: "Zwierzęta",
  OTHER: "Inne",
} as const;

export default async function KontaktyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      familyId: true,
      familyMember: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!user?.familyId || !user.familyMember) {
    redirect("/utworz-rodzine");
  }

  const contactsFromDb = await prisma.familyContact.findMany({
    where: {
      familyId: user.familyId,
    },
    orderBy: [{ favorite: "desc" }, { name: "asc" }],
  });

  const initialContacts: FamilyContact[] = contactsFromDb.map((contact) => ({
    id: contact.id,
    name: contact.name,
    category: categoryFromDb[contact.category],
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    address: contact.address ?? "",
    notes: contact.notes ?? "",
    favorite: contact.favorite,
  }));

  return (
    <ContactsPageContent
      initialContacts={initialContacts}
      canManageContacts={user.familyMember.role !== "CHILD"}
    />
  );
}
