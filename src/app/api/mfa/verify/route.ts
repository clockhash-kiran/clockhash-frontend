import { NextResponse, NextRequest } from "next/server";
import { validateTOTP } from "@/lib/mfa";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    console.log("🔹 Received MFA verification request");

    const { userId, token } = await req.json();
    console.log("🔹 Parsed request body:", { userId, token });

    if (!userId || !token) {
      console.warn("⚠️ Missing parameters in request");
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    console.log("🔹 Validating TOTP...");
    const isValid = await validateTOTP(userId, token);
    console.log("🔹 TOTP validation result:", isValid);

    if (!isValid) {
      console.warn("⚠️ Invalid TOTP code");
      return NextResponse.json({ error: "Invalid TOTP code" }, { status: 400 });
    }

    console.log("🔹 Marking MFA as completed in DB...");
    await db.user.update({
      where: { id: userId },
      data: { mfaCompleted: true },
    });
    console.log("✅ MFA marked as completed in DB");

    return NextResponse.json({ message: "MFA verified" });
  } catch (error) {
    console.error("❌ MFA verification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
