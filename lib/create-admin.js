import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("✅ Created:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
