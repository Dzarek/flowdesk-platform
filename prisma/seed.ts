import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@flowdesk.dev",
    },
  });

  if (admin) {
    console.log("Admin already exists");
    return;
  }

  const password = await bcrypt.hash("Admin123!", 10);

  await prisma.user.create({
    data: {
      email: "admin@flowdesk.dev",
      password,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
