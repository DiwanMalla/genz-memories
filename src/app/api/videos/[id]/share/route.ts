import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const videoId = params.id;

    // Increment share count for the video
    await prisma.video.update({
      where: { id: videoId },
      data: {
        shares: {
          increment: 1,
        },
      },
    });

    // Get updated share count
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { shares: true },
    });

    return NextResponse.json({
      success: true,
      shares: video?.shares || 0,
    });
  } catch (error) {
    console.error("Error sharing video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to share video" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const videoId = params.id;

    // Get current share count
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { shares: true },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      shares: video.shares,
    });
  } catch (error) {
    console.error("Error fetching share count:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch share count" },
      { status: 500 }
    );
  }
}
