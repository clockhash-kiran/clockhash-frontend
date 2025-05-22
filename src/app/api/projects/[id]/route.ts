import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT /api/projects/:id → Update project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await req.json();
    const { name, description, repoUrl, webhookSecret } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Fetch the current project to compare and minimize updates
    const currentProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!currentProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check for changes and build the update data object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (currentProject.name !== name) updateData.name = name;
    if (currentProject.description !== description)
      updateData.description = description;
    if (currentProject.repoUrl !== repoUrl) updateData.repoUrl = repoUrl;
    if (currentProject.webhookSecret !== webhookSecret)
      updateData.webhookSecret = webhookSecret;

    // If no changes, return early to avoid unnecessary DB operation
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes detected" },
        { status: 200 }
      );
    }

    // Proceed with the update if changes exist
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProject, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:id → Delete project
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  try {
    // Check if the project exists before attempting deletion
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Optionally delete related scans within a transaction
    const deleted = await prisma.$transaction(async (prismaTx) => {
      // Add cascading deletes for related data, like scans
      // Example: await prismaTx.scan.deleteMany({ where: { projectId } });

      return prismaTx.project.delete({
        where: { id: projectId },
      });
    });

    return NextResponse.json(
      { message: "Project deleted", project: deleted },
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
