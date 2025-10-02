"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useVideos } from "@/contexts/video-context";

// Import VideoCard dynamically with no SSR to prevent hydration issues
const VideoCard = dynamic(
  () => import("./video-card").then((mod) => ({ default: mod.VideoCard })),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    ),
  }
);

const VideoUpload = dynamic(
  () => import("./video-upload").then((mod) => ({ default: mod.VideoUpload })),
  {
    ssr: false,
  }
);

export function VideoFeed() {
  const [showUpload, setShowUpload] = useState(false);
  const { videos } = useVideos();

  return (
    <div className="relative">
      {/* Mobile-first TikTok-style feed */}
      <div className="md:max-w-md mx-auto">
        {/* Upload Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Video Cards */}
        <div className="space-y-0">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              isActive={index === 0} // First video is active by default
            />
          ))}
        </div>

        {/* Loading indicator */}
        <div className="py-8 text-center text-gray-500">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading more videos...</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && VideoUpload && (
        <VideoUpload onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}
