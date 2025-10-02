import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoFeed } from "@/components/video/video-feed-no-ssr";
import { TopNavigation } from "@/components/navigation/top-nav";
import { BottomNavigation } from "@/components/navigation/bottom-nav";

export default async function FeedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <VideoFeed />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
