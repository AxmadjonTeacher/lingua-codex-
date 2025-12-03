import { useState } from "react";
import { Header } from "@/components/Header";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { PhraseInput } from "@/components/PhraseInput";
import { PhraseList } from "@/components/PhraseList";
import { FlashcardReview } from "@/components/FlashcardReview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractYouTubeId } from "@/lib/youtube";
import { createPhrase } from "@/lib/phrases";
import { saveToPhraseBox } from "@/lib/storage";
import { Phrase, VideoEntry } from "@/types";
import { Play, Save, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MAX_PHRASES = 35;

export default function Index() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const handleLoadVideo = () => {
    const id = extractYouTubeId(youtubeUrl);
    if (id) {
      setVideoId(id);
      setPhrases([]);
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
    }
  };

  const handleAddPhrase = (text: string) => {
    if (phrases.length >= MAX_PHRASES) {
      toast({
        title: "Limit reached",
        description: `Maximum ${MAX_PHRASES} phrases allowed per video`,
        variant: "destructive",
      });
      return;
    }
    const newPhrase = createPhrase(text);
    setPhrases((prev) => [...prev, newPhrase]);
    toast({
      title: "Phrase added",
      description: "Definition and examples have been generated",
    });
  };

  const handleRemovePhrase = (id: string) => {
    setPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveToPhraseBox = () => {
    if (!videoId || phrases.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Add some phrases before saving",
        variant: "destructive",
      });
      return;
    }

    const entry: VideoEntry = {
      id: crypto.randomUUID(),
      youtubeUrl,
      youtubeId: videoId,
      title: `Video Study Session`,
      phrases,
      createdAt: Date.now(),
    };

    saveToPhraseBox(entry);
    toast({
      title: "Saved!",
      description: "Video and phrases added to your Phrase Box",
    });
  };

  if (showFlashcards) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-8">
          <FlashcardReview
            phrases={phrases}
            onClose={() => setShowFlashcards(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
            Study Phrases from Videos
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Learn new phrases and idioms from your favorite YouTube content
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-8">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="Paste a YouTube URL..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoadVideo()}
              className="flex-1"
            />
            <Button onClick={handleLoadVideo}>
              <Play className="mr-2 h-4 w-4" />
              Load
            </Button>
          </div>
        </div>

        {videoId && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Video Section */}
            <div className="space-y-6">
              <YouTubePlayer videoId={videoId} />
              
              <PhraseInput
                onAddPhrase={handleAddPhrase}
                phraseCount={phrases.length}
                maxPhrases={MAX_PHRASES}
              />
            </div>

            {/* Phrases Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Your Phrases
                </h2>
              </div>

              <PhraseList phrases={phrases} onRemove={handleRemovePhrase} />

              {phrases.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handleSaveToPhraseBox}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Add to Phrase Box
                  </Button>
                  <Button
                    variant="accent"
                    onClick={() => setShowFlashcards(true)}
                    className="flex-1"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Create Flashcards
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!videoId && (
          <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
              Get Started
            </h3>
            <p className="mt-2 text-muted-foreground">
              Paste a YouTube URL above to start studying phrases from videos
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
