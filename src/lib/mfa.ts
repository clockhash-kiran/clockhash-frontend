import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db } from "@/lib/db";

// 🔹 Function to Generate MFA Secret and QR Code
export async function generateMFASecret(userId: string) {
  const appname: string = process.env.APP_NAME ?? "";

  const secret = authenticator.generateSecret();
  const otpAuth = authenticator.keyuri(userId, appname, secret);

  // Generate QR Code
  const qrCode = await QRCode.toDataURL(otpAuth);

  // Store secret in database if it's newly generated

  await db.user.update({
    where: { id: userId },
    data: { mfaSecret: secret },
  });

  return { qrCode, secret };
}

// 🔹 Function to Validate TOTP Code
export async function validateTOTP(userId: string, token: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });

  if (!user?.mfaSecret) {
    return false;
  }

  return authenticator.verify({ token, secret: user.mfaSecret });
}

// 🔹 Function to Update MFA Status
export async function updateMFAStatus(userId: string, enabled: boolean) {
  await db.user.update({
    where: { id: userId },
    data: { mfaEnabled: enabled },
  });
}
export async function getMFAStatus(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.mfaEnabled;
  } catch (error) {
    console.error("Error retrieving MFA status:", error);
    throw error;
  }
}
