import { NextApiRequest, NextApiResponse } from "next";
import { setCookie } from "cookies-next";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Set userId in an HTTP-only cookie
  setCookie("userId", token.id, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({ message: "Cookie set successfully" });
}
