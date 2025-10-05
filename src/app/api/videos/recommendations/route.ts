import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    // Get user's activity if authenticated
    let userLikes: string[] = [];
    let userComments: string[] = [];
    let likedHashtags: string[] = [];

    if (userId) {
      try {
        // Get user's liked videos
        const likes = await prisma.like.findMany({
          where: { userId },
          include: {
            video: {
              select: {
                hashtags: true,
              },
            },
          },
          take: 50,
        });

        userLikes = likes.map((like) => like.videoId);

        // Extract hashtags from liked videos
        likedHashtags = likes
          .flatMap((like) => like.video.hashtags)
          .filter((hashtag, index, array) => array.indexOf(hashtag) === index); // Remove duplicates

        // Get user's commented videos
        const comments = await prisma.comment.findMany({
          where: { userId },
          select: { videoId: true },
          take: 50,
        });

        userComments = comments.map((comment) => comment.videoId);
      } catch (error) {
        console.error("Error fetching user activity:", error);
        // Continue with empty activity if there's an error
      }
    }

    // Build recommendation query
    const whereClause = {
      status: "APPROVED" as const,
      // Exclude videos user has already liked or commented on
      ...(userId && {
        id: {
          notIn: [...userLikes, ...userComments],
        },
      }),
    };

    // Fetch videos for recommendation
    const allVideos = await prisma.video.findMany({
      where: whereClause,
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
      take: 200, // Get more videos to calculate recommendations
    });

    // Calculate recommendation scores
    const videosWithScores = allVideos.map((video) => {
      let recommendationScore = 0;

      // Base engagement score
      const likes = video._count.likes;
      const comments = video._count.comments;
      const views = video.views;
      const shares = video.shares;
      const baseScore = likes * 2 + comments * 3 + views * 0.5 + shares * 2;

      recommendationScore += baseScore;

      // If user is authenticated, personalize recommendations
      if (userId && likedHashtags.length > 0) {
        // Hashtag similarity bonus
        const matchingHashtags = video.hashtags.filter((hashtag) =>
          likedHashtags.some(
            (likedTag) =>
              hashtag.toLowerCase().includes(likedTag.toLowerCase()) ||
              likedTag.toLowerCase().includes(hashtag.toLowerCase())
          )
        );

        // Significant boost for hashtag matches
        recommendationScore += matchingHashtags.length * 50;

        // Extra bonus for multiple hashtag matches (collaborative filtering)
        if (matchingHashtags.length > 1) {
          recommendationScore += matchingHashtags.length * 25;
        }
      }

      // Recency bonus (prefer newer content)
      const hoursOld =
        (Date.now() - video.createdAt.getTime()) / (1000 * 60 * 60);
      const recencyBonus = Math.max(0, 100 - hoursOld * 2); // Decreases over time
      recommendationScore += recencyBonus;

      // Diversity bonus (prefer content from different users)
      // This could be enhanced with user following data
      recommendationScore += Math.random() * 10; // Small randomization for diversity

      return {
        ...video,
        recommendationScore,
        matchingHashtags: userId
          ? video.hashtags.filter((hashtag) =>
              likedHashtags.some(
                (likedTag) =>
                  hashtag.toLowerCase().includes(likedTag.toLowerCase()) ||
                  likedTag.toLowerCase().includes(hashtag.toLowerCase())
              )
            )
          : [],
      };
    });

    // Sort by recommendation score and take top results
    const recommendedVideos = videosWithScores
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit)
      .map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description || "",
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl || video.videoUrl,
        user: {
          id: video.user.id,
          username: video.user.username,
          name: video.user.name || video.user.username,
          avatar:
            video.user.avatar ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        likes: video._count.likes,
        comments: video._count.comments,
        shares: video.shares,
        hashtags: video.hashtags,
        location: video.location || "Unknown",
        createdAt: video.createdAt.toISOString(),
        recommendationScore: Math.round(video.recommendationScore * 100) / 100,
        matchingHashtags: video.matchingHashtags || [],
      }));

    // If no videos found or user not authenticated, use fallback algorithm
    if (recommendedVideos.length === 0) {
      const fallbackVideos = await prisma.video.findMany({
        where: { status: "APPROVED" },
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
        orderBy: [{ views: "desc" }, { createdAt: "desc" }],
        take: limit,
      });

      const transformedFallback = fallbackVideos.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description || "",
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl || video.videoUrl,
        user: {
          id: video.user.id,
          username: video.user.username,
          name: video.user.name || video.user.username,
          avatar:
            video.user.avatar ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        likes: video._count.likes,
        comments: video._count.comments,
        shares: video.shares,
        hashtags: video.hashtags,
        location: video.location || "Unknown",
        createdAt: video.createdAt.toISOString(),
        recommendationScore: 0,
        matchingHashtags: [],
      }));

      return NextResponse.json({
        success: true,
        videos: transformedFallback,
        message: userId
          ? "Using fallback recommendations"
          : "Public recommendations (not personalized)",
        algorithm: "fallback_popular",
        personalized: false,
      });
    }

    return NextResponse.json({
      success: true,
      videos: recommendedVideos,
      message: userId
        ? "Personalized recommendations based on your activity"
        : "General recommendations",
      algorithm: userId
        ? "collaborative_filtering_with_engagement"
        : "engagement_based",
      personalized: !!userId,
      userActivity: userId
        ? {
            likedVideos: userLikes.length,
            commentedVideos: userComments.length,
            interestedHashtags: likedHashtags.length,
          }
        : null,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);

    // Return basic fallback on error
    const fallbackRecommendations = [
      {
        id: "rec-1",
        title: "Discover Amazing Content",
        description: "Explore the best videos from our community",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
        user: {
          id: "rec-user-1",
          username: "content_curator",
          name: "Content Curator",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
        },
        likes: 150,
        comments: 25,
        shares: 12,
        hashtags: ["#Discover", "#Community"],
        location: "Platform",
        createdAt: new Date().toISOString(),
        recommendationScore: 0,
        matchingHashtags: [],
      },
    ];

    return NextResponse.json({
      success: true,
      videos: fallbackRecommendations,
      message: "Using basic recommendations due to error",
      algorithm: "fallback",
      personalized: false,
    });
  } finally {
    await prisma.$disconnect();
  }
}
