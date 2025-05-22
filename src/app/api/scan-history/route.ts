// app/api/scans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  if (!userId || !projectId) {
    return NextResponse.json(
      { error: "Missing userId or projectId" },
      { status: 400 }
    );
  }

  try {
    const scans = await prisma.scan.findMany({
      where: {
        project: {
          userId,
        },
        projectId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ scans });
  } catch (err) {
    console.error("Error fetching scans:", err);
    return NextResponse.json(
      { error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}
