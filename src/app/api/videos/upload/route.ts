import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("video") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const hashtags = formData.get("hashtags") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "Video file and title are required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload video to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "genz-memories/videos",
            transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const cloudinaryResult = uploadResult as {
      public_id: string;
      secure_url: string;
      duration?: number;
      bytes?: number;
    };

    // Generate thumbnail URL from Cloudinary
    const thumbnailUrl = cloudinary.url(cloudinaryResult.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        { width: 400, height: 600, crop: "fill" },
        { quality: "auto" },
      ],
    });

    // Parse hashtags
    const hashtagsArray = hashtags
      ? hashtags
          .split(/[,\s]+/)
          .filter((tag) => tag.trim())
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      : ["#GenZ", "#Activism"];

    // First, ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@temp.com`, // Temporary email
        username: `user_${userId.slice(-8)}`,
      },
    });

    // Save to database
    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        videoUrl: cloudinaryResult.secure_url,
        thumbnailUrl,
        location: location?.trim() || null,
        hashtags: hashtagsArray,
        duration: cloudinaryResult.duration,
        size: cloudinaryResult.bytes,
        userId,
        status: "APPROVED", // Auto-approve for now
      },
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      video: {
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
      },
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
