import { NextResponse } from "next/server";
import { updateMFAStatus } from "@/lib/mfa";

export async function POST(req: Request) {
  try {
    console.log("UPDATE MFA POST request received");

    const { userId, action } = await req.json();
    console.log("Received userId:", userId);

    if (!userId) {
      console.error("User ID is required but not provided");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log("Enabling MFA for userId:", userId);
    const enabled = action === "true";
    await updateMFAStatus(userId, enabled); // ✅ Await the async function

    console.log("MFA enabled successfully");
    return NextResponse.json({ message: "MFA enabled successfully" }, { status: 200 }); // ✅ Send response
  } catch (error) {
    console.error("Error enabling MFA:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
