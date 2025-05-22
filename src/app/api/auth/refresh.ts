import { db } from "@/lib/db";
import { hash, compare } from "bcrypt";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token provided" },
        { status: 400 }
      );
    }

    const session = await db.session.findFirst({
      where: { refreshToken },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }
    if (session.refreshToken) {
      const isValid = await compare(refreshToken, session.refreshToken);

      if (!isValid) {
        return NextResponse.json(
          { message: "Invalid refresh token" },
          { status: 401 }
        );
      }
    }
    const now = new Date();
    if (session.refreshTokenExpires && now > session.refreshTokenExpires) {
      await db.session.deleteMany({ where: { id: session.id } });
      return NextResponse.json(
        { message: "Refresh token expired" },
        { status: 403 }
      );
    }

    // Generate new tokens
    const newRefreshToken = randomBytes(32).toString("hex");
    const hashedNewRefreshToken = await hash(newRefreshToken, 10);
    const refreshTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.session.update({
      where: { id: session.id },
      data: {
        refreshToken: hashedNewRefreshToken,
        refreshTokenExpires,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return NextResponse.json(
      {
        refreshToken: newRefreshToken,
        message: "Token refreshed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
