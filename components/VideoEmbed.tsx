'use client';

import { getYouTubeVideoId } from '@/lib/data';

interface VideoEmbedProps {
  url: string;
}

export default function VideoEmbed({ url }: VideoEmbedProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">ไม่สามารถโหลดวิดีโอได้</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
