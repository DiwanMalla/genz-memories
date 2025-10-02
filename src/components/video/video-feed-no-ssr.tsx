"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
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
  const [activeVideoId, setActiveVideoId] = useState("");
  const { videos } = useVideos();

  // Set initial active video
  useEffect(() => {
    if (videos.length > 0 && !activeVideoId) {
      setActiveVideoId(videos[0].id);
    }
  }, [videos, activeVideoId]);

  return (
    <div className="relative">
      {/* Upload Button - YouTube Style */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowUpload(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Responsive Layout */}
      {/* Mobile: TikTok-style vertical feed */}
      <div className="block md:hidden">
        <div className="max-w-md mx-auto">
          <div className="space-y-0">
            {videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={index === 0}
                layout="mobile"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop/Tablet: YouTube/Netflix Style Layout */}
      <div className="hidden md:block min-h-screen bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Filter Tags */}
          <div className="mb-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap">
                All
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap">
                Climate Action
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap">
                Social Justice
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap">
                Education Reform
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap">
                Human Rights
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap">
                Recent
              </button>
            </div>
          </div>

          {/* Trending Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Trending Now</h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {videos.slice(0, 6).map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={activeVideoId === video.id}
                  layout="desktop"
                  onClick={() => setActiveVideoId(video.id)}
                />
              ))}
            </div>
          </div>

          {/* Recommended Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recommended for you</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={activeVideoId === video.id}
                  layout="desktop"
                  onClick={() => setActiveVideoId(video.id)}
                />
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-8">
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">
              Show more
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator for mobile */}
      <div className="md:hidden py-8 text-center text-gray-500">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2">Loading more videos...</p>
      </div>

      {/* Upload Modal */}
      {showUpload && VideoUpload && (
        <VideoUpload onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}
