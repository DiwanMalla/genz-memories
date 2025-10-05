"use client";

import { useState, useRef, useEffect } from "react";
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
  ArrowLeft,
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
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: Date;
  likes: number;
  replies?: Comment[];
}

export function VideoDetailPage({ videoId }: VideoDetailPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const { videos, isLoading } = useVideos();
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for individual video fetch
  const [fetchedVideo, setFetchedVideo] = useState<Video | null>(null);
  const [individualLoading, setIndividualLoading] = useState(false);

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

  const relatedVideos = videos.filter((v) => v.id !== videoId).slice(0, 8);

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
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(currentVideo?.likes || 0);
  const [showComments, setShowComments] = useState(true);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      userId: "user1",
      username: "activist_marie",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
      text: "This movement is so important! We need to keep pushing for change. 💪",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 12,
      replies: [
        {
          id: "1-1",
          userId: "user2",
          username: "young_leader",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          text: "Absolutely! Every voice matters in this fight.",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          likes: 5,
        },
      ],
    },
    {
      id: "2",
      userId: "user3",
      username: "climate_warrior",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      text: "I was there! The energy was incredible. Thanks for documenting this historic moment.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 28,
    },
  ]);
  const [newComment, setNewComment] = useState("");

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

  const toggleLike = () => {
    if (!user) return; // Require authentication for liking
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || "user",
      avatar:
        user.imageUrl ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      text: newComment.trim(),
      timestamp: new Date(),
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Video Header */}
      <div className="border-b border-gray-800 p-4 pt-20 md:pt-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">
              {currentVideo.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">
                by {currentVideo.user.name}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-400">
                {formatTimeAgo(new Date(currentVideo.createdAt))}
              </span>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  isLiked
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm">{formatCount(likesCount)}</span>
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{formatCount(likesCount)}</span>
                </button>
              </SignInButton>
            )}

            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
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
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>{formatCount(likesCount)} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span>{formatCount(currentVideo.comments)} comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-green-400" />
                    <span>{formatCount(currentVideo.shares || 0)} shares</span>
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
                  Comments ({comments.length})
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
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className="flex gap-3">
                        <Image
                          src={comment.avatar}
                          alt={comment.username}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm">
                                {comment.username}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">
                              {comment.text}
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

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-11 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <Image
                                src={reply.avatar}
                                alt={reply.username}
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="bg-gray-800/30 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium text-sm">
                                      {reply.username}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {formatTimeAgo(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">
                                    {reply.text}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  <button className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                    <ThumbsUp className="w-3 h-3" />
                                    {reply.likes}
                                  </button>
                                  <button className="text-gray-400 hover:text-white transition-colors">
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Videos */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6">More Videos</h2>
              <div className="space-y-4">
                {relatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer group"
                    onClick={() => router.push(`/watch/${video.id}`)}
                  >
                    <div className="relative aspect-video w-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {video.user.username}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatCount(video.likes)} likes •{" "}
                        {formatTimeAgo(new Date(video.createdAt))}
                      </p>
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
