import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Validate GitHub signature
function verifySignature(
  secret: string,
  payload: string,
  signature: string | null
) {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload, "utf-8");
  const digest = `sha256=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // Replace with lookup logic based on repo URL
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";

  if (!verifySignature(webhookSecret, body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  const payload = JSON.parse(body);

  if (event === "push") {
    // Handle push event (e.g. trigger scan for related project)
    console.log("Push received from:", payload.repository.full_name);
  }

  return NextResponse.json({ ok: true });
}
