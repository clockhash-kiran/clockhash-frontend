import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/projects → Fetch projects for a specific user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        scans: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            toolName: true,
            status: true, // Assumes status is an ENUM in Prisma and DB
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(projects, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("GET /api/projects error:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/projects → Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, userId, repoUrl, webhookSecret } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: name or userId" },
        { status: 400 }
      );
    }

    // Prevent duplicate project names for a user
    const existingProject = await prisma.project.findUnique({
      where: {
        userId_name: { userId, name }, // Compound unique constraintyy
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project with this name already exists for the user" },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
        repoUrl,
        webhookSecret,
      },
    });

    return NextResponse.json(project, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("POST /api/projects error:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    return NextResponse.json(
      {
        error: "Failed to create project",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
