// app/api/mfa/status/route.ts
import { NextResponse } from "next/server";
import { getMFAStatus } from "@/lib/mfa"; // Implement this server-side function
import { getSessionSafe } from "@/lib/auth-session";

export async function GET() {
  const session = await getSessionSafe();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mfaEnabled = await getMFAStatus(session.user.id);
    return NextResponse.json({ mfaEnabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to retrieve MFA status" },
      { status: 500 }
    );
  }
}
