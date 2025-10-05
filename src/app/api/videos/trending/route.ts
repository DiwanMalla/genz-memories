import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get videos from the last 7 days for trending calculation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentVideos = await prisma.video.findMany({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: sevenDaysAgo,
        },
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
      take: 100, // Get recent videos for trending analysis
    });

    // Calculate trending scores
    const trendingVideos = recentVideos
      .map((video) => {
        const now = new Date();
        const hoursOld =
          (now.getTime() - video.createdAt.getTime()) / (1000 * 60 * 60);
        const daysOld = Math.max(0.1, hoursOld / 24); // Minimum 0.1 to avoid division issues

        // Engagement metrics
        const likes = video._count.likes;
        const comments = video._count.comments;
        const views = video.views;
        const shares = video.shares;

        // Weighted engagement score
        const engagementScore =
          likes * 3 + comments * 5 + views * 1 + shares * 4;

        // Trending algorithm: engagement per day with recency boost
        const velocityScore = engagementScore / daysOld;

        // Boost for very recent content (less than 24 hours)
        const recencyBoost = hoursOld < 24 ? 2 : 1;

        const trendingScore = velocityScore * recencyBoost;

        return {
          ...video,
          trendingScore,
          engagementScore,
          velocity: velocityScore,
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20) // Top 20 trending videos
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
        trendingScore: Math.round(video.trendingScore * 100) / 100, // Round for display
      }));

    // Fallback trending videos if no recent videos
    if (trendingVideos.length === 0) {
      const fallbackTrending = [
        {
          id: "trending-1",
          title: "Breaking: Climate Action Goes Viral",
          description:
            "Young activists worldwide are making their voices heard",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
          user: {
            id: "trending-user-1",
            username: "climate_leader",
            name: "Maya Green",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
          },
          likes: 2800,
          comments: 340,
          shares: 156,
          hashtags: ["#ClimateAction", "#Trending", "#Viral"],
          location: "Global",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          trendingScore: 95.7,
        },
        {
          id: "trending-2",
          title: "Student Unity Movement Spreads",
          description:
            "Students across universities unite for education reform",
          videoUrl:
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1573164574511-73c773193279?w=400&h=600&fit=crop",
          user: {
            id: "trending-user-2",
            username: "student_voice",
            name: "Alex Rivera",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          },
          likes: 1950,
          comments: 245,
          shares: 89,
          hashtags: ["#StudentRights", "#Education", "#Unity"],
          location: "Multiple Cities",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          trendingScore: 78.3,
        },
      ];

      return NextResponse.json({
        success: true,
        videos: fallbackTrending,
        message: "Using trending fallback data",
        algorithm: "engagement_velocity_with_recency_boost",
      });
    }

    return NextResponse.json({
      success: true,
      videos: trendingVideos,
      message: "Trending videos calculated from recent engagement",
      algorithm: "engagement_velocity_with_recency_boost",
      timeframe: "last_7_days",
    });
  } catch (error) {
    console.error("Error calculating trending videos:", error);

    // Return fallback data on error
    const fallbackTrending = [
      {
        id: "trending-1",
        title: "Breaking: Climate Action Goes Viral",
        description: "Young activists worldwide are making their voices heard",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
        user: {
          id: "trending-user-1",
          username: "climate_leader",
          name: "Maya Green",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
        },
        likes: 2800,
        comments: 340,
        shares: 156,
        hashtags: ["#ClimateAction", "#Trending", "#Viral"],
        location: "Global",
        createdAt: new Date().toISOString(),
        trendingScore: 95.7,
      },
    ];

    return NextResponse.json({
      success: true,
      videos: fallbackTrending,
      message: "Using trending fallback data due to error",
      algorithm: "fallback",
    });
  } finally {
    await prisma.$disconnect();
  }
}
