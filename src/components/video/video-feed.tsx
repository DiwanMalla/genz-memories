"use client";

import { useState } from "react";
import { VideoCard } from "./video-card";
import { VideoUpload } from "./video-upload";
import { Plus } from "lucide-react";

// Mock data for now
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
    createdAt: new Date("2025-10-01"),
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
    createdAt: new Date("2025-09-30"),
  },
];

export function VideoFeed() {
  const [showUpload, setShowUpload] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(mockVideos[0]?.id);

  return (
    <div className="relative">
      {/* Upload Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowUpload(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Responsive Layout */}
      {/* Mobile: TikTok-style vertical feed */}
      <div className="block lg:hidden">
        <div className="max-w-md mx-auto">
          <div className="space-y-0">
            {mockVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={index === 0} // First video is active by default
                layout="mobile"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet: Grid Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Discover Stories
            </h1>
            <p className="text-gray-400">
              Explore powerful voices and movements from Generation Z
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {mockVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={activeVideoId === video.id}
                layout="desktop"
                onClick={() => setActiveVideoId(video.id)}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-12">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full transition-colors">
              Load More Videos
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator for mobile */}
      <div className="lg:hidden py-8 text-center text-gray-500">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2">Loading more videos...</p>
      </div>

      {/* Upload Modal */}
      {showUpload && <VideoUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}
