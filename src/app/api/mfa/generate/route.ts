// api/auth/mfa/generate/route.ts

import { NextResponse } from "next/server";
import { generateMFASecret } from "@/lib/mfa";

export async function POST(req: Request) {
  try {
    console.log("MFA generation POST request received"); // Log when the request is received

    const { userId } = await req.json();
    console.log("Received userId:", userId); // Log the received userId

    if (!userId) {
      console.error("User ID is required but not provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Generating MFA secret for userId:", userId);
    const { qrCode, secret } = await generateMFASecret(userId);

    console.log("MFA secret generated successfully");
    return NextResponse.json({ qrCode, secret });
  } catch (error) {
    console.error("MFA generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
