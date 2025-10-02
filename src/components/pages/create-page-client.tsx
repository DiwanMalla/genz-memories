"use client";

import { useRouter } from "next/navigation";
import { TopNavigation } from "@/components/navigation/top-nav";
import { BottomNavigation } from "@/components/navigation/bottom-nav";
import { VideoUpload } from "@/components/video/video-upload";

export function CreatePageClient() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <VideoUpload onClose={handleClose} />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
