// lib/email.ts
import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, verificationToken: string) {
  console.log("start sending mail")
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Gmail service
    auth: {
      user: process.env.EMAIL_USER,  // Gmail account email
      pass: process.env.EMAIL_PASSWORD,  // Gmail password or app password
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    text: `Click the following link to verify your email: ${verificationUrl}`,
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent.", verificationUrl);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}
