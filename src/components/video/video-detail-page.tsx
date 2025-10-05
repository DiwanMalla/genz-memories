"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Send,
  ThumbsUp,
  Flag,
  Bookmark,
  Download,
  Settings,
} from "lucide-react";
import { useVideos, Video } from "@/contexts/video-context";
import { useUser, SignInButton } from "@clerk/nextjs";
import { TopNavigation } from "@/components/navigation/top-nav";

interface VideoDetailPageProps {
  videoId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  likes: number;
}

export function VideoDetailPage({ videoId }: VideoDetailPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const { videos, isLoading } = useVideos();
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for individual video fetch
  const [fetchedVideo, setFetchedVideo] = useState<Video | null>(null);
  const [individualLoading, setIndividualLoading] = useState(false);

  // State for related videos from database
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Find the current video from context first
  let currentVideo = videos.find((v) => v.id === videoId);

  // Update page title dynamically
  useEffect(() => {
    if (currentVideo || fetchedVideo) {
      const videoTitle = (currentVideo || fetchedVideo)?.title;
      document.title = `${videoTitle} | GenZ Memories`;
    } else if (!isLoading && !individualLoading) {
      document.title = "Video not found | GenZ Memories";
    } else {
      document.title = "Loading video... | GenZ Memories";
    }

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = "GenZ Memories - Preserve the Voice of Change";
    };
  }, [currentVideo, fetchedVideo, isLoading, individualLoading]);

  // If video not found in context and context finished loading, fetch individual video
  useEffect(() => {
    if (!isLoading && !currentVideo && !fetchedVideo && !individualLoading) {
      const fetchIndividualVideo = async () => {
        try {
          setIndividualLoading(true);
          const response = await fetch(`/api/public/videos?id=${videoId}`);
          const data = await response.json();

          if (response.ok && data.videos && data.videos.length > 0) {
            setFetchedVideo(data.videos[0]);
          }
        } catch (error) {
          console.error("Failed to fetch individual video:", error);
        } finally {
          setIndividualLoading(false);
        }
      };

      fetchIndividualVideo();
    }
  }, [videoId, isLoading, currentVideo, fetchedVideo, individualLoading]);

  // Use fetched video if current video not found in context
  if (!currentVideo && fetchedVideo) {
    currentVideo = fetchedVideo;
  }

  // Fetch related videos from database
  useEffect(() => {
    const fetchRelatedVideos = async () => {
      try {
        setRelatedLoading(true);
        const response = await fetch(`/api/public/videos?sort=latest&limit=8`);
        const data = await response.json();

        if (response.ok && data.videos) {
          // Filter out the current video and get different videos
          const filtered = data.videos.filter((v: Video) => v.id !== videoId);
          setRelatedVideos(filtered.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch related videos:", error);
        // Fallback to context videos if API fails
        const contextRelated = videos
          .filter((v) => v.id !== videoId)
          .slice(0, 6);
        setRelatedVideos(contextRelated);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedVideos();
  }, [videoId, videos]);

  // Update page title dynamically
  useEffect(() => {
    if (currentVideo) {
      document.title = `${currentVideo.title} | GenZ Memories`;
    } else if (!isLoading && !individualLoading) {
      document.title = "Video not found | GenZ Memories";
    } else {
      document.title = "Loading video... | GenZ Memories";
    }

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = "GenZ Memories - Preserve the Voice of Change";
    };
  }, [currentVideo, isLoading, individualLoading]);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [viewTracked, setViewTracked] = useState(false);

  // Social interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  // Loading states
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [sharingInProgress, setSharingInProgress] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Fetch like status
  const fetchLikeStatus = useCallback(async () => {
    if (!currentVideo || !user) return;

    try {
      const response = await fetch(`/api/videos/${currentVideo.id}/like`);
      const data = await response.json();

      if (data.success) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error("Failed to fetch like status:", error);
    }
  }, [currentVideo, user]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!currentVideo) return;

    try {
      setCommentsLoading(true);
      const response = await fetch(`/api/videos/${currentVideo.id}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
        setCommentsCount(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, [currentVideo]);

  // Initialize social data when video is available
  useEffect(() => {
    if (currentVideo) {
      // Initialize counts from video data
      setLikesCount(currentVideo.likes || 0);
      setCommentsCount(currentVideo.comments || 0);
      setSharesCount(currentVideo.shares || 0);
      setViewsCount(currentVideo.views || 0);

      // Fetch like status if user is logged in
      if (user) {
        fetchLikeStatus();
      }

      // Fetch comments
      fetchComments();
    }
  }, [currentVideo, user, fetchLikeStatus, fetchComments]);

  // Show loading spinner while videos are being fetched
  if (isLoading || individualLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading video...</h2>
          <p className="text-gray-400">
            Please wait while we fetch the video details
          </p>
        </div>
      </div>
    );
  }

  // Show "not found" only after loading is complete and video is not found
  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-gray-400 mb-6">
            The video you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/feed")}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
            >
              Browse Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Video controls
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
        // Track view when video starts playing
        trackView();
      }
    } catch (error) {
      console.error("Video play error:", error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Social interaction handlers
  const toggleLike = async () => {
    if (!user || !currentVideo) return;

    try {
      setLikingInProgress(true);
      const response = await fetch(`/api/videos/${currentVideo.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLikingInProgress(false);
    }
  };

  const handleShare = async () => {
    if (!currentVideo) return;

    try {
      setSharingInProgress(true);

      // First, try to use Web Share API if available
      if (navigator.share) {
        const shareData = {
          title: currentVideo.title,
          text: currentVideo.description,
          url: window.location.href,
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
        }
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }

      // Increment share count on server
      const response = await fetch(`/api/videos/${currentVideo.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setSharesCount(data.shares);
      }
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setSharingInProgress(false);
    }
  };

  const trackView = async () => {
    if (!currentVideo || viewTracked) return;

    try {
      const response = await fetch(`/api/videos/${currentVideo.id}/views`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setViewsCount(data.views);
        setViewTracked(true);
      }
    } catch (error) {
      console.error("Failed to track view:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !currentVideo) return;

    try {
      const response = await fetch(`/api/videos/${currentVideo.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Add new comment to the beginning
        setComments([data.comment, ...comments]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      } else {
        console.error("Failed to post comment:", data.message);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const formatFullDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown date";
    // Format as "October 5, 2025 at 3:45 PM"
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (date: Date | string | undefined) => {
    if (!date) return "Unknown date";
    // Format as "October 5, 2025" (no time)
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return "Unknown time";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid time";
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  const formatCount = (count: number | undefined) => {
    if (!count || count === 0) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <TopNavigation />

      <div className="max-w-7xl mx-auto p-6 my-15">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                poster={currentVideo.thumbnailUrl}
                onClick={togglePlay}
              >
                <source src={currentVideo.videoUrl} type="video/mp4" />
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {/* Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={togglePlay}
                    className="bg-black/80 hover:bg-black/90 p-4 rounded-full transform hover:scale-110 transition-all duration-200"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Top Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={toggleMute}
                    className="bg-black/60 hover:bg-black/80 p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button className="bg-black/60 hover:bg-black/80 p-3 rounded-full backdrop-blur-sm transition-colors">
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              {/* Video Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-gray-400 text-sm">
                  <button
                    onClick={user ? toggleLike : undefined}
                    disabled={likingInProgress}
                    className={`flex items-center gap-2 transition-colors ${
                      user
                        ? "hover:text-red-400 cursor-pointer"
                        : "cursor-default"
                    } ${isLiked ? "text-red-400" : ""}`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? "fill-red-400 text-red-400" : "text-red-400"}`}
                    />
                    <span>{formatCount(likesCount)} likes</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span>{formatCount(commentsCount)} comments</span>
                  </div>
                  <button
                    onClick={handleShare}
                    disabled={sharingInProgress}
                    className="flex items-center gap-2 hover:text-green-400 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-green-400" />
                    <span>{formatCount(sharesCount)} shares</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    </div>
                    <span>{formatCount(viewsCount)} views</span>
                  </div>
                </div>

                {/* Additional Actions */}
                <div className="flex items-center gap-2">
                  {user ? (
                    <>
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <SignInButton mode="modal">
                        <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors opacity-60">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </SignInButton>
                      <SignInButton mode="modal">
                        <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors opacity-60">
                          <Download className="w-4 h-4" />
                        </button>
                      </SignInButton>
                    </>
                  )}
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Title and Metadata */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {currentVideo.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formatCount(currentVideo.views)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formatFullDate(new Date(currentVideo.createdAt))}
                    </span>
                  </div>
                </div>

                {/* Video Description */}
                {currentVideo.description && (
                  <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {currentVideo.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-4">
                  <Image
                    src={currentVideo.user.avatar}
                    alt={currentVideo.user.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-semibold">
                      {currentVideo.user.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      @{currentVideo.user.username}
                    </p>
                    <p className="text-gray-500 text-xs">
                      📍 {currentVideo.location}
                    </p>
                  </div>
                </div>
                {user ? (
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-medium">
                    Follow
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors font-medium">
                      Sign in to Follow
                    </button>
                  </SignInButton>
                )}
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {currentVideo.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentVideo.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm hover:bg-purple-600/30 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({commentsCount})
                </h2>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showComments ? "Hide" : "Show"}
                </button>
              </div>

              {/* Comment Form */}
              {user && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex gap-3">
                    <Image
                      src={user.imageUrl || ""}
                      alt="Your avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              {showComments && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {commentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-400">Loading comments...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="flex gap-3">
                          <Image
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium text-sm">
                                  {comment.user.name}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  @{comment.user.username}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {formatTimeAgo(new Date(comment.createdAt))}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {comment.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <button className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                <ThumbsUp className="w-3 h-3" />
                                {comment.likes}
                              </button>
                              <button className="text-gray-400 hover:text-white transition-colors">
                                Reply
                              </button>
                              <button className="text-gray-400 hover:text-red-400 transition-colors">
                                <Flag className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No comments yet</p>
                      <p className="text-gray-500 text-sm">
                        Be the first to comment!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Related Videos */}
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl border border-gray-700/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Play className="w-4 h-4 text-white" />
                </div>
                More Videos
              </h2>
              <div className="space-y-3">
                {relatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-3 p-3 hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push(`/watch/${video.id}`)}
                  >
                    <div className="relative aspect-video w-28 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {video.duration && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 rounded-full p-2">
                          <Play className="w-4 h-4 text-gray-900 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {video.user.avatar ? (
                          <Image
                            src={video.user.avatar}
                            alt={video.user.username}
                            width={20}
                            height={20}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {video.user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-gray-300 text-xs font-medium">
                          {video.user.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{formatCount(video.views)} views</span>
                        <span>•</span>
                        <span>{formatDateOnly(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
