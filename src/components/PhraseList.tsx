import { Phrase } from "@/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhraseListProps {
  phrases: Phrase[];
  onRemove: (id: string) => void;
}

export function PhraseList({ phrases, onRemove }: PhraseListProps) {
  if (phrases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">
          No phrases added yet. Add phrases from videos you're studying.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {phrases.map((phrase, index) => (
        <div
          key={phrase.id}
          className="card-elevated animate-fade-in p-4"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <h4 className="font-heading text-lg font-semibold text-foreground">
                "{phrase.text}"
              </h4>
              {phrase.definition && (
                <p className="text-sm text-muted-foreground">
                  {phrase.definition}
                </p>
              )}
              {phrase.examples && phrase.examples.length > 0 && (
                <div className="space-y-1 border-l-2 border-accent/50 pl-3">
                  {phrase.examples.map((example, i) => (
                    <p key={i} className="text-sm italic text-muted-foreground">
                      {example}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(phrase.id)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
