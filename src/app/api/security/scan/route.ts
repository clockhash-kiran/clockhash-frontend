// app/api/security/scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    projectId,
    toolId,
    toolName,
    category,
    targetUrl,
    summary,
    results,
    status,
  } = body;

  if (
    !projectId ||
    !toolId ||
    !toolName ||
    !category ||
    !targetUrl ||
    !status
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const test = await prisma.test.create({
      data: {
        projectId,
        toolId,
        toolName,
        category,
        targetUrl,
        summary,
        results,
        status,
      },
    });
    return NextResponse.json(test, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run or save test" },
      { status: 500 }
    );
  }
}
