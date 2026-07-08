import { prisma } from "@/lib/prisma";

export const userRepository = {
  async findAll() {
    return prisma.user.findMany();
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(data: {
    email: string;
    password: string;
    name?: string;
    role: "ADMIN" | "STAFF" | "USER";
  }) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};
