import { VideoDetailPage } from "@/components/video/video-detail-page";

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  return <VideoDetailPage videoId={id} />;
}
