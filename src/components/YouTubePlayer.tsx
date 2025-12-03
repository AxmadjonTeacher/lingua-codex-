import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
}

export function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-foreground">
      <div className="relative aspect-video w-full">
        <iframe
          src={getYouTubeEmbedUrl(videoId)}
          title={title || "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
