import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { PhraseInput } from "@/components/PhraseInput";
import { PhraseList } from "@/components/PhraseList";
import { FlashcardReview } from "@/components/FlashcardReview";
import { Button } from "@/components/ui/button";
import { getVideoEntry, saveToPhraseBox, removeFromPhraseBox } from "@/lib/storage";
import { createPhrase } from "@/lib/phrases";
import { VideoEntry, Phrase } from "@/types";
import { GraduationCap, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MAX_PHRASES = 35;

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<VideoEntry | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);

  useEffect(() => {
    if (id) {
      const videoEntry = getVideoEntry(id);
      if (videoEntry) {
        setEntry(videoEntry);
      } else {
        navigate("/phrase-box");
      }
    }
  }, [id, navigate]);

  if (!entry) {
    return null;
  }

  const handleAddPhrase = (text: string) => {
    if (entry.phrases.length >= MAX_PHRASES) {
      toast({
        title: "Limit reached",
        description: `Maximum ${MAX_PHRASES} phrases allowed per video`,
        variant: "destructive",
      });
      return;
    }
    const newPhrase = createPhrase(text);
    const updatedEntry = {
      ...entry,
      phrases: [...entry.phrases, newPhrase],
    };
    setEntry(updatedEntry);
    saveToPhraseBox(updatedEntry);
    toast({
      title: "Phrase added",
      description: "Definition and examples have been generated",
    });
  };

  const handleRemovePhrase = (phraseId: string) => {
    const updatedEntry = {
      ...entry,
      phrases: entry.phrases.filter((p) => p.id !== phraseId),
    };
    setEntry(updatedEntry);
    saveToPhraseBox(updatedEntry);
  };

  const handleRemoveFromBox = () => {
    removeFromPhraseBox(entry.id);
    toast({
      title: "Removed",
      description: "Entry removed from your Phrase Box",
    });
    navigate("/phrase-box");
  };

  if (showFlashcards) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-8">
          <FlashcardReview
            phrases={entry.phrases}
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
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/phrase-box")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Phrase Box
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Video Section */}
          <div className="space-y-6">
            <YouTubePlayer videoId={entry.youtubeId} />
            
            <PhraseInput
              onAddPhrase={handleAddPhrase}
              phraseCount={entry.phrases.length}
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

            <PhraseList phrases={entry.phrases} onRemove={handleRemovePhrase} />

            {entry.phrases.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleRemoveFromBox}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove from Phrase Box
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
      </main>
    </div>
  );
}
