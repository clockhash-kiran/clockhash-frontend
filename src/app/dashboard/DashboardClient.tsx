"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Scan {
  id: string;
  toolName: string;
  category: string;
  status: string;
  createdAt: string;
}

interface DashboardClientProps {
  projects: Project[];
  recentScans: Scan[];
}

export default function DashboardClient({
  projects = [],
  recentScans = [],
}: DashboardClientProps) {
  const MAX_RECENT_SCANS = 5;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <ul className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <li
                  key={project.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div className="truncate max-w-[75%]">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {project.description}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/projects"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Manage
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No projects yet. Create one under &quot;Projects&quot;.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length > 0 ? (
            <ul className="text-sm space-y-3">
              {recentScans.slice(0, MAX_RECENT_SCANS).map((scan) => (
                <li key={scan.id ?? scan.createdAt} className="border-b pb-2">
                  <div className="font-medium truncate">{scan.toolName}</div>
                  <div className="text-gray-500 text-sm">
                    {scan.category} • {scan.status} •{" "}
                    {new Date(scan.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No scans have been run yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
