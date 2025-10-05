import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const videoId = params.id;

    // Check if user already liked this video
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingLike) {
      // Unlike the video
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Video unliked",
      });
    } else {
      // Like the video
      await prisma.like.create({
        data: {
          userId,
          videoId,
        },
      });

      return NextResponse.json({
        success: true,
        liked: true,
        message: "Video liked",
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const videoId = params.id;

    // Get total likes count
    const likesCount = await prisma.like.count({
      where: { videoId },
    });

    // Check if current user has liked (if authenticated)
    let isLiked = false;
    if (userId) {
      const userLike = await prisma.like.findUnique({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({
      success: true,
      likes: likesCount,
      isLiked,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}