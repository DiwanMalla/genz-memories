import { VideoDetailPage } from "@/components/video/video-detail-page";

interface WatchPageProps {
  params: {
    id: string;
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  return <VideoDetailPage videoId={params.id} />;
}
