import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const videoId = params.id;

    // Increment view count for the video
    await prisma.video.update({
      where: { id: videoId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Get updated view count
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { views: true },
    });

    return NextResponse.json({
      success: true,
      views: video?.views || 0,
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { success: false, message: "Failed to increment view count" },
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

    // Get current view count
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { views: true },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: video.views,
    });
  } catch (error) {
    console.error("Error fetching view count:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch view count" },
      { status: 500 }
    );
  }
}