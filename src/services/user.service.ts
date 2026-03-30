import { userRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";

export const userService = {
  async getUsers() {
    return userRepository.findAll();
  },

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    role: "ADMIN" | "STAFF" | "USER";
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return userRepository.create({
      ...data,
      password: hashedPassword,
    });
  },

  async deleteUser(id: string) {
    return userRepository.delete(id);
  },
};
