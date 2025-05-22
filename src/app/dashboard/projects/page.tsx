// app/projects/page.tsx
import { getProjectsByUser } from "@/lib/db"; // server-side DB function
import ProjectsClient from "./ProjectClient";
import { getSessionSafe } from "@/lib/auth-session";

export default async function ProjectsPage() {
  const session = await getSessionSafe();
  if (!session?.user?.id) return null;

  const projects = await getProjectsByUser(session.user.id);

  return <ProjectsClient projects={projects} userId={session.user.id} />;
}
