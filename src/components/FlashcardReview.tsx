import { useState, useEffect } from "react";
import { Flashcard as FlashcardType, Phrase } from "@/types";
import { Flashcard } from "./Flashcard";
import { Button } from "@/components/ui/button";
import { RotateCcw, X } from "lucide-react";

interface FlashcardReviewProps {
  phrases: Phrase[];
  onClose: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FlashcardReview({ phrases, onClose }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);

  const initializeCards = () => {
    const cards: FlashcardType[] = phrases
      .filter((p) => p.definition)
      .map((phrase) => ({
        id: phrase.id,
        phrase: phrase.text,
        definition: phrase.definition!,
        examples: phrase.examples || [],
      }));
    setFlashcards(shuffleArray(cards));
    setCurrentIndex(0);
  };

  useEffect(() => {
    initializeCards();
  }, [phrases]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">
          No flashcards available. Add some phrases first!
        </p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const isComplete = currentIndex >= flashcards.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Flashcard Review
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {currentIndex < flashcards.length && (
        <Flashcard
          flashcard={flashcards[currentIndex]}
          onNext={handleNext}
          currentIndex={currentIndex}
          totalCards={flashcards.length}
        />
      )}

      {isComplete && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-lg text-foreground">
            🎉 You've reviewed all cards!
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={initializeCards}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Review Again
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
