// src/app/dashboard/scans/page.tsx
import { getProjectsByUser } from "@/lib/db";
import ScansClient from "./ScansClient";
import { getSessionSafe } from "@/lib/auth-session";

export default async function ScansPage() {
  const session = await getSessionSafe();
  if (!session?.user?.id) return null;

  const projects = await getProjectsByUser(session.user.id);

  return <ScansClient userId={session.user.id} initialProjects={projects} />;
}
