import { NextResponse } from "next/server";
import { userService } from "@/src/services/user.service";

export async function GET() {
  const users = await userService.getUsers();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();

  const user = await userService.createUser(body);

  return NextResponse.json(user);
}
