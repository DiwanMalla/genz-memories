import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock video data as fallback
const mockVideos = [
  {
    id: "1",
    title: "Climate March 2025",
    description: "Thousands gathered for climate action in downtown",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
    user: {
      id: "1",
      username: "activist_sarah",
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
    },
    duration: 154, // 2:34 in seconds
    likes: 1250,
    comments: 89,
    shares: 45,
    views: 8750,
    hashtags: ["#ClimateChange", "#Activism", "#GenZ"],
    location: "New York City",
    createdAt: "2025-10-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Student Rights Protest",
    description: "University students demanding education reform",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1573164574511-73c773193279?w=400&h=600&fit=crop",
    user: {
      id: "2",
      username: "young_leader",
      name: "Alex Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    duration: 187, // 3:07 in seconds
    likes: 890,
    comments: 67,
    shares: 23,
    views: 6420,
    hashtags: ["#EducationReform", "#StudentRights", "#Change"],
    location: "Berkeley, CA",
    createdAt: "2025-09-30T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Community Garden Initiative",
    description: "Local community comes together to create sustainable spaces",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop",
    user: {
      id: "3",
      username: "green_thumb",
      name: "Maria Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    duration: 203, // 3:23 in seconds
    likes: 567,
    comments: 34,
    shares: 12,
    views: 4200,
    hashtags: ["#Community", "#Sustainability", "#GreenLiving"],
    location: "Portland, OR",
    createdAt: "2025-09-28T00:00:00.000Z",
  },
  {
    id: "4",
    title: "Youth Mental Health Awareness",
    description: "Breaking the stigma around mental health in schools",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=600&fit=crop",
    user: {
      id: "4",
      username: "mind_matters",
      name: "Jordan Kim",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    duration: 276, // 4:36 in seconds
    likes: 1100,
    comments: 156,
    shares: 67,
    views: 9850,
    hashtags: ["#MentalHealth", "#YouthAdvocacy", "#Awareness"],
    location: "Austin, TX",
    createdAt: "2025-09-27T00:00:00.000Z",
  },
  {
    id: "5",
    title: "Digital Rights March",
    description: "Protecting online privacy and digital freedoms",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
    user: {
      id: "5",
      username: "privacy_defender",
      name: "Sam Taylor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    duration: 192, // 3:12 in seconds
    likes: 890,
    comments: 78,
    shares: 45,
    views: 7320,
    hashtags: ["#DigitalRights", "#Privacy", "#TechActivism"],
    location: "San Francisco, CA",
    createdAt: "2025-09-25T00:00:00.000Z",
  },
  {
    id: "6",
    title: "Affordable Housing Rally",
    description: "Demanding accessible housing for all communities",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop",
    user: {
      id: "6",
      username: "housing_advocate",
      name: "Riley Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
    },
    duration: 168, // 2:48 in seconds
    likes: 723,
    comments: 45,
    shares: 28,
    views: 5680,
    hashtags: ["#HousingJustice", "#AffordableHousing", "#Community"],
    location: "Seattle, WA",
    createdAt: "2025-09-24T00:00:00.000Z",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");
    const hashtagsParam = searchParams.get("hashtags");
    const sortParam = searchParams.get("sort") || "latest";
    const limit = parseInt(searchParams.get("limit") || "50");

    // If requesting a specific video by ID
    if (videoId) {
      const video = await prisma.video.findUnique({
        where: {
          id: videoId,
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
      });

      if (video) {
        const transformedVideo = {
          id: video.id,
          title: video.title,
          description: video.description || "",
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl || video.videoUrl,
          duration: video.duration,
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
          views: video.views,
          hashtags: video.hashtags,
          location: video.location || "Unknown",
          createdAt: video.createdAt.toISOString(),
        };

        return NextResponse.json({
          success: true,
          videos: [transformedVideo],
          count: 1,
          message: "Video found",
        });
      } else {
        // Check mock data as fallback
        const mockVideo = mockVideos.find((v) => v.id === videoId);
        if (mockVideo) {
          return NextResponse.json({
            success: true,
            videos: [mockVideo],
            count: 1,
            message: "Video found in fallback data",
          });
        }

        return NextResponse.json(
          {
            success: false,
            videos: [],
            count: 0,
            message: "Video not found",
          },
          { status: 404 }
        );
      }
    }

    // Parse hashtags filter for general video fetching
    const selectedHashtags = hashtagsParam
      ? hashtagsParam.split(",").map((tag) => tag.trim().toLowerCase())
      : [];

    // Build where clause for hashtag filtering
    const whereClause = {
      status: "APPROVED" as const,
      ...(selectedHashtags.length > 0 && {
        hashtags: {
          hasSome: selectedHashtags
            .map((tag) =>
              // Try different variations of the hashtag
              [
                tag,
                `#${tag}`,
                tag.charAt(0).toUpperCase() + tag.slice(1),
                `#${tag.charAt(0).toUpperCase() + tag.slice(1)}`,
              ]
            )
            .flat(),
        },
      }),
    };

    // Fetch videos based on sort parameter
    let videos;

    if (sortParam === "latest" || sortParam === "recent") {
      // For latest videos, simply order by creation date
      videos = await prisma.video.findMany({
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
        orderBy: {
          createdAt: "desc", // Most recent first
        },
        take: limit,
      });
    } else {
      // For other sorting, get more videos for algorithm calculation
      videos = await prisma.video.findMany({
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
        take: 200, // Get more videos to properly calculate scores
      });
    }

    let sortedVideos;

    if (sortParam === "latest" || sortParam === "recent") {
      // Videos are already sorted by creation date
      sortedVideos = videos;
    } else {
      // Calculate scores and sort for other algorithms
      const videosWithTrendingScore = videos.map((video) => {
        const now = new Date();
        const videoAge =
          (now.getTime() - video.createdAt.getTime()) / (1000 * 60 * 60); // Age in hours
        const daysSinceCreated = Math.max(1, videoAge / 24); // Minimum 1 day to avoid division by zero

        // Engagement metrics
        const likes = video._count.likes;
        const comments = video._count.comments;
        const views = video.views;
        const shares = video.shares;

        // Calculate engagement score (weighted)
        const engagementScore =
          likes * 3 + comments * 5 + views * 1 + shares * 4;

        // Algorithm selection
        let trendingScore = 0;

        if (sortParam === "trending") {
          // Trending: High engagement with recency boost
          const recencyMultiplier = Math.max(
            0.1,
            1 / Math.sqrt(daysSinceCreated)
          );
          trendingScore = engagementScore * recencyMultiplier;
        } else if (sortParam === "popular") {
          // Popular: Pure engagement score
          trendingScore = engagementScore;
        } else {
          // Default: Time-based with slight engagement boost
          trendingScore =
            now.getTime() - video.createdAt.getTime() + engagementScore * 100;
        }

        return {
          ...video,
          trendingScore,
          engagementScore,
        };
      });

      // Sort by the calculated score
      sortedVideos = videosWithTrendingScore
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit); // Take requested amount
    }

    // Transform the data to match our frontend interface
    const transformedVideos = sortedVideos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description || "",
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || video.videoUrl, // Fallback to video URL if no thumbnail
      duration: video.duration,
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
      views: video.views,
      hashtags: video.hashtags,
      location: video.location || "Unknown",
      createdAt: video.createdAt.toISOString(),
    }));

    // If no videos in database, return mock data as fallback
    let finalVideos =
      transformedVideos.length > 0 ? transformedVideos : mockVideos;

    // If using mock data, apply sorting and limit
    if (transformedVideos.length === 0) {
      if (sortParam === "latest" || sortParam === "recent") {
        finalVideos = mockVideos
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, limit);
      } else {
        finalVideos = mockVideos.slice(0, limit);
      }
    }

    // Debug logging
    console.log("Database videos count:", transformedVideos.length);
    console.log("Using mock data:", transformedVideos.length === 0);
    if (finalVideos.length > 0) {
      console.log("First video views:", finalVideos[0].views);
      console.log("First video duration:", finalVideos[0].duration);
    }

    return NextResponse.json({
      success: true,
      videos: finalVideos,
      count: finalVideos.length,
      message:
        transformedVideos.length > 0
          ? "Videos fetched from database"
          : "Using fallback data",
      filters: {
        hashtags: selectedHashtags,
        sort: sortParam,
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);

    // Return mock data as fallback on database error
    return NextResponse.json({
      success: true,
      videos: mockVideos,
      count: mockVideos.length,
      message: "Using fallback data due to database error",
      filters: {
        hashtags: [],
        sort: "latest",
      },
    });
  }
}
