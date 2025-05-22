// app/api/auth/signout/route.ts
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  (await cookieStore).delete("next-auth.session-token");
  (await cookieStore).delete("next-auth.callback-url");
  (await cookieStore).delete("next-auth.csrf-token");

  return new Response("Signed out", { status: 200 });
}
