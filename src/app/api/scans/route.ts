// app/api/scans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!userId || !projectId) {
    return NextResponse.json(
      { error: "Missing userId or projectId" },
      { status: 400 }
    );
  }

  try {
    // Calculate the skip (offset) for pagination
    const skip = (page - 1) * limit;

    // Fetch scans with pagination
    const scans = await prisma.scan.findMany({
      where: {
        project: {
          userId,
        },
        projectId,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get the total count of scans to calculate total pages
    const totalScans = await prisma.scan.count({
      where: {
        project: {
          userId,
        },
        projectId,
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalScans / limit);

    return NextResponse.json({ scans, totalPages });
  } catch (err) {
    console.error("Error fetching scans:", err);
    return NextResponse.json(
      { error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}
