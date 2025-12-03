import { VideoEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoEntryCardProps {
  entry: VideoEntry;
  onRemove: (id: string) => void;
}

export function VideoEntryCard({ entry, onRemove }: VideoEntryCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${entry.youtubeId}/mqdefault.jpg`;

  return (
    <div className="card-elevated flex flex-col overflow-hidden sm:flex-row animate-fade-in">
      <div className="relative aspect-video w-full shrink-0 sm:w-48">
        <img
          src={thumbnailUrl}
          alt={entry.title}
          className="h-full w-full object-cover"
        />
        <a
          href={entry.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 transition-opacity hover:opacity-100"
        >
          <ExternalLink className="h-8 w-8 text-primary-foreground" />
        </a>
      </div>
      
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.phrases.length} phrase{entry.phrases.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" asChild>
            <Link to={`/review/${entry.id}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              Review
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(entry.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
