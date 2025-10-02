import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      location: video.location,
      hashtags: video.hashtags,
      createdAt: video.createdAt,
      user: {
        id: video.user.id,
        username: video.user.username || "anonymous",
        name: video.user.name || "Anonymous User",
        avatar: video.user.avatar || "/default-avatar.png",
      },
      likes: video._count.likes,
      comments: video._count.comments,
      shares: video.shares,
      views: video.views,
    }));

    return NextResponse.json({ videos: formattedVideos });
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
