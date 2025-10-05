"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useVideos, Video } from "@/contexts/video-context";
import {
  VideoGridSkeleton,
  VideoFeedSkeleton,
} from "@/components/ui/video-skeleton";
import { HashtagFilter } from "@/components/hashtags/hashtag-filter";

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
  const router = useRouter();
  const { user } = useUser();
  const [showUpload, setShowUpload] = useState(false);
  const [showHashtagFilter, setShowHashtagFilter] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("");
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const { filteredVideos, isLoading, selectedHashtags, setSelectedHashtags } =
    useVideos();

  // Fetch trending videos
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setTrendingLoading(true);
        const response = await fetch("/api/videos/trending");
        const data = await response.json();

        if (response.ok && data.videos) {
          setTrendingVideos(data.videos);
        }
      } catch (error) {
        console.error("Failed to fetch trending videos:", error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Fetch recommended videos or latest videos for non-users
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setRecommendedLoading(true);
        // If user is logged in, get personalized recommendations
        // Otherwise, get latest videos
        const endpoint = user 
          ? "/api/videos/recommendations?limit=12"
          : "/api/public/videos?sort=latest&limit=12";
        
        const response = await fetch(endpoint);
        const data = await response.json();

        if (response.ok && data.videos) {
          setRecommendedVideos(data.videos);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setRecommendedLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]); // Re-fetch when user changes (login/logout)

  // Set initial active video
  useEffect(() => {
    if (filteredVideos.length > 0 && !activeVideoId) {
      setActiveVideoId(filteredVideos[0].id);
    }
  }, [filteredVideos, activeVideoId]);

  // Handle video navigation
  const handleVideoClick = (videoId: string) => {
    router.push(`/watch/${videoId}`);
  };

  return (
    <div className="relative">
      {/* Upload Button - Only for logged-in users */}
      {user ? (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div className="fixed bottom-6 right-6 z-50">
          <SignInButton mode="modal">
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-medium">
                Sign in to Upload
              </span>
            </button>
          </SignInButton>
        </div>
      )}

      {/* Responsive Layout */}
      {/* Mobile: TikTok-style vertical feed */}
      <div className="block md:hidden">
        <div className="max-w-md mx-auto">
          {isLoading ? (
            <VideoFeedSkeleton />
          ) : (
            <div className="space-y-0">
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={index === 0}
                  layout="mobile"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop/Tablet: YouTube/Netflix Style Layout */}
      <div className="hidden md:block min-h-screen bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Hashtag Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Filter by Hashtags
              </h2>
              <button
                onClick={() => setShowHashtagFilter(!showHashtagFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter ({selectedHashtags.length})
              </button>
            </div>

            {showHashtagFilter && (
              <div className="mb-6">
                <HashtagFilter
                  selectedTags={selectedHashtags}
                  onTagsChange={setSelectedHashtags}
                  onClose={() => setShowHashtagFilter(false)}
                />
              </div>
            )}

            {/* Active Filters Display */}
            {selectedHashtags.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  Active filters:
                </span>
                {selectedHashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedHashtags(
                        selectedHashtags.filter((t) => t !== tag)
                      )
                    }
                    className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    #{tag}
                    <span className="text-xs">×</span>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedHashtags([])}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Trending Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Trending Now</h2>
                <div className="flex items-center gap-1 px-2 py-1 bg-red-600/20 border border-red-500/30 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-xs font-medium">LIVE</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/trending")}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View all
              </button>
            </div>
            {trendingLoading ? (
              <VideoGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {trendingVideos.slice(0, 6).map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isActive={activeVideoId === video.id}
                    layout="desktop"
                    onClick={() => handleVideoClick(video.id)}
                  />
                ))}
                {trendingVideos.length === 0 && !trendingLoading && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">
                      No trending videos at the moment
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Check back later for hot content!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recommended Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  {user ? "Recommended for you" : "Latest videos"}
                </h2>
                {user && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-400 text-xs font-medium">
                      PERSONALIZED
                    </span>
                  </div>
                )}
              </div>
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Refresh
              </button>
            </div>
            {recommendedLoading ? (
              <VideoGridSkeleton count={12} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {recommendedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isActive={activeVideoId === video.id}
                    layout="desktop"
                    onClick={() => handleVideoClick(video.id)}
                  />
                ))}
                {recommendedVideos.length === 0 && !recommendedLoading && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">
                      {user
                        ? "No personalized recommendations yet"
                        : "No videos available"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {user
                        ? "Interact with more videos to get better recommendations!"
                        : "Check back later for content"}
                    </p>
                  </div>
                )}
              </div>
            )}
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
