"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

interface Video {
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
  createdAt: Date | string; // Allow both Date and string for API flexibility
}

interface VideoContextType {
  videos: Video[];
  addVideo: (
    videoData: Omit<
      Video,
      "id" | "user" | "likes" | "comments" | "shares" | "createdAt"
    >
  ) => void;
  removeVideo: (id: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Mock initial data
const initialVideos: Video[] = [
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
    likes: 1250,
    comments: 89,
    shares: 45,
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
    likes: 890,
    comments: 67,
    shares: 23,
    hashtags: ["#EducationReform", "#StudentRights", "#Change"],
    location: "Berkeley, CA",
    createdAt: new Date("2025-09-30"),
  },
];

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const { user } = useUser();

  // Fetch videos from API on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();
        if (response.ok && data.videos) {
          setVideos(data.videos);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
        // Keep using initial videos as fallback
      }
    };

    fetchVideos();
  }, []);

  const addVideo = (
    videoData: Omit<
      Video,
      "id" | "user" | "likes" | "comments" | "shares" | "createdAt"
    >
  ) => {
    if (!user) {
      toast.error("You must be logged in to upload videos");
      return;
    }

    const newVideo: Video = {
      ...videoData,
      id: `video_${Date.now()}`,
      user: {
        id: user.id,
        username:
          user.username || user.emailAddresses[0]?.emailAddress || "user",
        name: user.fullName || "Anonymous User",
        avatar:
          user.imageUrl ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      },
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date(),
    };

    // Add the new video to the beginning of the array (first position)
    setVideos((prevVideos) => [newVideo, ...prevVideos]);

    // Show success toast
    toast.success("🎉 Video uploaded successfully!", {
      duration: 4000,
      style: {
        background: "#1f2937",
        color: "#fff",
        border: "1px solid #374151",
      },
    });
  };

  const removeVideo = (id: string) => {
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
    toast.success("Video removed");
  };

  return (
    <VideoContext.Provider value={{ videos, addVideo, removeVideo }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideos must be used within a VideoProvider");
  }
  return context;
}

export type { Video };
