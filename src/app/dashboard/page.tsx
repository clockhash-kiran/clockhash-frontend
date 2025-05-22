// app/dashboard/page.tsx
import { getProjectsByUser, getRecentScansByUser, db } from "@/lib/db"; // include direct db import
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/auth-session";

export default async function DashboardPage() {
  console.log("Dashboard page rendering started");

  try {
    // Get the user session
    const session = await getSessionSafe();

    // Check if the user is authenticated
    if (!session?.user?.id) {
      console.log("No user session found, redirecting to login");
      redirect("/api/auth/signin");
    }

    const userId = session.user.id;
    console.log(`Fetching data for user: ${userId}`);

    // Fetch data with error handling
    let projects = [];
    let recentScans = [];

    try {
      console.log("Fetching projects...");
      projects = await getProjectsByUser(userId);
      console.log(`Fetched ${projects.length} projects`);
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Fallback to direct DB query if Redis fails
      try {
        projects = await db.project.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        console.log(
          `Fallback: Fetched ${projects.length} projects directly from DB`
        );
      } catch (dbError) {
        console.error("Even direct DB query failed:", dbError);
      }
    }

    try {
      console.log("Fetching recent scans...");
      recentScans = await getRecentScansByUser(userId);
      console.log(`Fetched ${recentScans.length} recent scans`);
    } catch (error) {
      console.error("Error fetching recent scans:", error);
      // Fallback to direct DB query if Redis fails
      try {
        recentScans = await db.scan.findMany({
          where: {
            project: {
              userId: userId,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });
        console.log(
          `Fallback: Fetched ${recentScans.length} scans directly from DB`
        );
      } catch (dbError) {
        console.error("Even direct DB query failed:", dbError);
      }
    }

    console.log("All data fetched, rendering dashboard client");

    return (
      <DashboardClient
        projects={projects}
        recentScans={recentScans}
        userId={userId}
      />
    );
  } catch (error) {
    console.error("Unhandled error in dashboard page:", error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Dashboard Error</h1>
        <p>Sorry, we encountered an error loading your dashboard.</p>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }
}
