"use client";

interface VideoCardSkeletonProps {
  layout?: "mobile" | "desktop";
}

export function VideoCardSkeleton({
  layout = "mobile",
}: VideoCardSkeletonProps) {
  if (layout === "mobile") {
    return (
      <div className="relative h-screen w-full bg-gray-900 flex items-center justify-center animate-pulse">
        <div className="relative w-full h-full max-w-md mx-auto bg-gray-800 rounded-lg">
          {/* Video skeleton */}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg"></div>

          {/* Loading overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-700/80 backdrop-blur-sm p-4 rounded-full">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* User info skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-600 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-700 rounded w-32 animate-pulse"></div>
              </div>
            </div>

            {/* Title skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="h-3 bg-gray-700 rounded w-8 mt-1 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout skeleton
  return (
    <div className="group cursor-pointer animate-pulse">
      {/* Video thumbnail skeleton */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl overflow-hidden mb-3">
        {/* Loading shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer transform -skew-x-12"></div>

        {/* Play button skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-600 rounded-full animate-pulse"></div>
        </div>

        {/* Duration badge skeleton */}
        <div className="absolute bottom-2 right-2 bg-gray-600 rounded w-12 h-4 animate-pulse"></div>

        {/* Quick actions skeleton */}
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Video info skeleton */}
      <div className="flex gap-3">
        {/* User avatar skeleton */}
        <div className="w-9 h-9 bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title skeleton */}
          <div className="space-y-1">
            <div className="h-4 bg-gray-600 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
          </div>

          {/* Channel name skeleton */}
          <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>

          {/* Views and time skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <div className="h-3 bg-gray-700 rounded w-12 animate-pulse"></div>
          </div>
        </div>

        {/* More options skeleton */}
        <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
      </div>
    </div>
  );
}

// Grid of skeleton cards for desktop
export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {[...Array(count)].map((_, i) => (
        <VideoCardSkeleton key={i} layout="desktop" />
      ))}
    </div>
  );
}

// Mobile feed skeleton
export function VideoFeedSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(3)].map((_, i) => (
        <VideoCardSkeleton key={i} layout="mobile" />
      ))}
    </div>
  );
}
