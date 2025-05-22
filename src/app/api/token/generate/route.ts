import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db"; // Your Prisma instance
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { user } = session || {};

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawToken = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "90d",
  });

  const tokenHash = await hash(rawToken, 10);

  await prisma.apiToken.create({
    data: {
      userId: user.id,
      tokenHash,
      label: "Generated via Settings UI",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90d
    },
  });

  return NextResponse.json({ token: rawToken });
}
