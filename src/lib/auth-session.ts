"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/auth-options"; // now in server-only folder

export async function getSessionSafe() {
  return await getServerSession(authOptions);
}
