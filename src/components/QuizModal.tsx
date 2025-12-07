import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phrase } from "@/types";
import { Timer, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  phrases: Phrase[];
}

interface QuizQuestion {
  phrase: Phrase;
  sentence: string;
  correctAnswer: string;
}

interface WrongAnswer {
  phraseText: string;
  count: number;
}

export function QuizModal({ open, onClose, phrases }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<Map<string, number>>(new Map());
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Initialize quiz when opened
  useEffect(() => {
    if (open && phrases.length > 0) {
      const quizQuestions: QuizQuestion[] = phrases.map((phrase) => {
        // Get an example sentence or create a generic one
        const example = phrase.examples?.[0] || `The word "${phrase.text}" is used in this context.`;
        // Create fill-in-the-blank by replacing the phrase text
        const regex = new RegExp(phrase.text, "gi");
        const sentence = example.replace(regex, "______");
        
        return {
          phrase,
          sentence,
          correctAnswer: phrase.text,
        };
      });

      // Shuffle questions
      const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setAvailableOptions(phrases.map((p) => p.text));
      setTimeLeft(phrases.length * 8);
      setWrongAnswers(new Map());
      setIsFinished(false);
      setCorrectCount(0);
      setShakingOption(null);
    }
  }, [open, phrases]);

  // Timer countdown
  useEffect(() => {
    if (!open || isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, isFinished, timeLeft]);

  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (isFinished || shakingOption) return;

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    if (selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
      // Correct answer
      setCorrectCount((prev) => prev + 1);
      setAvailableOptions((prev) => prev.filter((opt) => opt !== selectedAnswer));
      
      // Move to next question
      if (currentIndex + 1 >= questions.length) {
        setIsFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      // Wrong answer - shake and track
      setShakingOption(selectedAnswer);
      setWrongAnswers((prev) => {
        const newMap = new Map(prev);
        const currentCount = newMap.get(selectedAnswer) || 0;
        newMap.set(selectedAnswer, currentCount + 1);
        return newMap;
      });

      setTimeout(() => {
        setShakingOption(null);
      }, 500);
    }
  }, [currentIndex, questions, isFinished, shakingOption]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    setIsFinished(false);
    setQuestions([]);
    onClose();
  };

  if (!open) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header with timer */}
        <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
          <h2 className="text-xl font-bold">Vocabulary Quiz</h2>
          <div className="flex items-center gap-2 text-lg font-mono">
            <Timer className="h-5 w-5" />
            <span className={cn(timeLeft <= 10 && "text-red-300 animate-pulse")}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="p-6">
          {isFinished ? (
            // Results screen
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">Quiz Complete!</h3>
                <p className="mt-2 text-muted-foreground">
                  You got {correctCount} out of {questions.length} correct
                </p>
              </div>

              {wrongAnswers.size > 0 && (
                <div className="rounded-lg border border-border">
                  <div className="border-b border-border bg-muted/50 px-4 py-2">
                    <h4 className="font-semibold text-foreground">Wrong Answers</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {Array.from(wrongAnswers.entries()).map(([phrase, count]) => (
                      <div key={phrase} className="flex items-center justify-between px-4 py-3">
                        <span className="text-foreground">{phrase}</span>
                        <span className="flex items-center gap-1 text-destructive">
                          <XCircle className="h-4 w-4" />
                          {count} {count === 1 ? "time" : "times"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wrongAnswers.size === 0 && correctCount === questions.length && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-medium">Perfect score! No wrong answers!</span>
                </div>
              )}

              <Button onClick={handleClose} className="w-full">
                Close Quiz
              </Button>
            </div>
          ) : currentQuestion ? (
            // Question screen
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="rounded-lg bg-muted/50 p-6">
                <p className="text-center text-lg text-foreground">
                  {currentQuestion.sentence}
                </p>
              </div>

              <div className="grid gap-3">
                {availableOptions.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className={cn(
                      "h-auto py-4 text-left text-base transition-all",
                      shakingOption === option && "animate-shake border-destructive bg-destructive/10"
                    )}
                    onClick={() => handleAnswer(option)}
                    disabled={shakingOption !== null}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Loading...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
