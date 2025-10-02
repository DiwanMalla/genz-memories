'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Play } from 'lucide-react';
import Image from 'next/image';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    user: {
      id: string;
      username: string;
      name: string;
      avatar: string;
    };
    likes: number;
    comments: number;
    shares: number;
    hashtags: string[];
    location: string;
    createdAt: Date;
  };
  isActive: boolean;
}

export function VideoCard({ video, isActive }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only mount on client to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimeAgo = () => {
    if (!mounted) return '';
    
    const now = new Date();
    const diffInMs = now.getTime() - video.createdAt.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) return `${diffInDays}d`;
    if (diffInHours > 0) return `${diffInHours}h`;
    return 'now';
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Add event listeners to sync state with actual video state
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setIsPlaying(false);

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);

    const handleVideoState = async () => {
      try {
        if (isActive && !videoElement.paused) {
          // Video should be playing
          if (videoElement.readyState >= 2) {
            await videoElement.play();
          }
        } else {
          // Video should be paused
          if (!videoElement.paused) {
            videoElement.pause();
          }
        }
      } catch (error) {
        // Handle play/pause interruption gracefully
        console.log('Video state change interrupted:', error);
      }
    };

    handleVideoState();

    // Cleanup event listeners
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [isActive]);

  const togglePlay = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    try {
      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        await videoElement.play();
        setIsPlaying(true);
      }
    } catch (error) {
      // Handle play interruption gracefully
      console.log('Video play interrupted:', error);
      setIsPlaying(false);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center">
      {/* Video Player */}
      <div className="relative w-full h-full max-w-md mx-auto">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          loop
          muted
          playsInline
          preload="metadata"
          poster={video.thumbnailUrl}
          onClick={togglePlay}
          suppressHydrationWarning
        >
          <source src={video.videoUrl} type="video/mp4" />
        </video>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={togglePlay}
              className="bg-white/20 backdrop-blur-sm p-4 rounded-full"
            >
              <Play className="w-8 h-8 text-white" />
            </button>
          </div>
        )}

        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={video.user.avatar}
              alt={video.user.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
            <div>
              <p className="text-white font-semibold">@{video.user.username}</p>
              <p className="text-gray-300 text-sm">
                {video.location} • {formatTimeAgo()} {formatTimeAgo() && 'ago'}
              </p>
            </div>
          </div>

          {/* Video Title and Description */}
          <div className="mb-3">
            <h3 className="text-white font-semibold text-lg mb-1">{video.title}</h3>
            <p className="text-gray-200 text-sm mb-2">{video.description}</p>
            <div className="flex flex-wrap gap-1">
              {video.hashtags.map((tag) => (
                <span key={tag} className="text-purple-400 text-sm hover:text-purple-300 cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={toggleLike}
              className={`p-3 rounded-full ${
                isLiked ? 'bg-red-500' : 'bg-black/30 backdrop-blur-sm'
              } transition-all duration-300`}
            >
              <Heart 
                className={`w-6 h-6 ${
                  isLiked ? 'text-white fill-current' : 'text-white'
                }`} 
              />
            </button>
            <span className="text-white text-sm mt-1">{formatCount(likesCount)}</span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center">
            <button className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-sm mt-1">{formatCount(video.comments)}</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
              <Share2 className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-sm mt-1">{formatCount(video.shares)}</span>
          </div>

          {/* More Options */}
          <button className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
            <MoreVertical className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}