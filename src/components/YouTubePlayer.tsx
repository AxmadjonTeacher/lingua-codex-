import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface YouTubePlayerProps {
  videoId: string;
}

export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <iframe
        src={getYouTubeEmbedUrl(videoId)}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
