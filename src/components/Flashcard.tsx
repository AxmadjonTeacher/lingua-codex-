import { useState } from "react";
import { Flashcard as FlashcardType } from "@/types";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  flashcard: FlashcardType;
  onNext: () => void;
  currentIndex: number;
  totalCards: number;
}

export function Flashcard({ flashcard, onNext, currentIndex, totalCards }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(onNext, 300);
    } else {
      setIsFlipped(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {totalCards}
        </span>
      </div>
      
      <div 
        className="flashcard-flip mx-auto h-72 w-full max-w-md cursor-pointer"
        onClick={handleFlip}
      >
        <div className={cn("flashcard-inner relative h-full w-full", isFlipped && "flipped")}>
          <div className="flashcard-front absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 shadow-lg">
            <p className="mb-4 text-center text-lg text-foreground">
              {flashcard.definition}
            </p>
            <p className="text-sm text-muted-foreground">
              Tap to reveal the phrase
            </p>
          </div>
          
          <div className="flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-primary bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-center text-2xl font-bold text-primary">
              "{flashcard.phrase}"
            </h3>
            {flashcard.examples.length > 0 && (
              <p className="text-center text-sm italic text-muted-foreground">
                {flashcard.examples[0]}
              </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Tap to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
