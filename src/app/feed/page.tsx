import { VideoFeed } from "@/components/video/video-feed-no-ssr";
import { TopNavigation } from "@/components/navigation/top-nav";
import { BottomNavigation } from "@/components/navigation/bottom-nav";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <VideoFeed />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
