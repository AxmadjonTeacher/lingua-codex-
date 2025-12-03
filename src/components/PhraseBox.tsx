import { useState } from "react";
import { Phrase } from "@/types";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PhraseBoxProps {
  phrases: Phrase[];
  onAddPhrase: (text: string) => void;
  onRemovePhrase: (id: string) => void;
  maxPhrases: number;
}

export function PhraseBox({ phrases, onAddPhrase, onRemovePhrase, maxPhrases }: PhraseBoxProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() && phrases.length < maxPhrases) {
      onAddPhrase(input.trim());
      setInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Phrase Box</h3>
        <span className="text-sm text-muted-foreground">
          {phrases.length} / {maxPhrases}
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a new phrase..."
          disabled={phrases.length >= maxPhrases}
          className="flex-1 bg-input text-primary-foreground placeholder:text-primary-foreground/50"
        />
        <Button
          size="icon"
          onClick={handleAdd}
          disabled={!input.trim() || phrases.length >= maxPhrases}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {phrases.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No phrases added yet.</p>
          <p className="text-sm text-muted-foreground">Type a phrase above to get AI definitions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {phrases.map((phrase) => (
            <div
              key={phrase.id}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">"{phrase.text}"</p>
                {phrase.definition && (
                  <p className="mt-1 text-sm text-muted-foreground">{phrase.definition}</p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemovePhrase(phrase.id)}
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
