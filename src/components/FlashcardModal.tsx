import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phrase } from "@/types";
import { playPCM } from "@/lib/audioService";
import { X, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardModalProps {
  open: boolean;
  onClose: () => void;
  phrases: Phrase[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FlashcardModal({ open, onClose, phrases }: FlashcardModalProps) {
  const [cards, setCards] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (open && phrases.length > 0) {
      const validCards = phrases.filter((p) => p.definition && p.definition !== "Generating definition...");
      setCards(shuffleArray(validCards));
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [open, phrases]);

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCard?.audioData) {
      await playPCM(currentCard.audioData);
    }
  };

  if (!currentCard) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Flashcards</DialogTitle>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No flashcards available. Add some phrases first!
            </p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Flashcard Review</DialogTitle>
        
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-4 text-white">
          <div className="rounded-lg bg-secondary/80 px-4 py-2 text-sm font-medium text-secondary-foreground">
            Card {currentIndex + 1} of {cards.length}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">{currentCard.text}</span>
            <span className="text-sm text-muted-foreground">Click card to flip</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Card */}
        <div 
          className="flashcard-flip mx-auto h-96 w-full max-w-2xl cursor-pointer px-4"
          onClick={handleFlip}
        >
          <div className={cn("flashcard-inner relative h-full w-full", isFlipped && "flipped")}>
            {/* Front - Definition */}
            <div className="flashcard-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-card p-8 shadow-2xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Definition
              </p>
              <p className="text-center text-2xl font-medium text-foreground">
                {currentCard.definition}
              </p>
              <p className="mt-8 text-sm text-muted-foreground">
                Tap to reveal phrase
              </p>
            </div>

            {/* Back - Phrase with Examples */}
            <div className="flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[hsl(210,25%,12%)] p-8 shadow-2xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                The Phrase
              </p>
              <h2 className="mb-6 text-center text-4xl font-bold text-white">
                {currentCard.text}
              </h2>
              
              {currentCard.audioData && (
                <Button
                  variant="secondary"
                  onClick={handlePlayAudio}
                  className="mb-6"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Play Audio
                </Button>
              )}

              {currentCard.examples && currentCard.examples.length > 0 && (
                <div className="w-full max-w-md space-y-3">
                  {currentCard.examples.map((example, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/20 bg-white/5 p-4 text-center italic text-white/90"
                    >
                      "{example}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-center gap-4 px-4">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="min-w-28"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex >= cards.length - 1}
            className="min-w-28"
          >
            Next Card
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
