import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PhraseInputProps {
  onAddPhrase: (text: string) => void;
  disabled?: boolean;
  phraseCount: number;
  maxPhrases: number;
}

export function PhraseInput({ onAddPhrase, disabled, phraseCount, maxPhrases }: PhraseInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && phraseCount < maxPhrases) {
      onAddPhrase(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-heading text-lg font-medium text-foreground">
          Add Phrases
        </label>
        <span className="text-sm text-muted-foreground">
          {phraseCount}/{maxPhrases} phrases
        </span>
      </div>
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a phrase or sentence to study..."
          disabled={disabled || phraseCount >= maxPhrases}
          className="min-h-[100px] resize-none pr-12 font-body"
        />
        <Button
          size="icon"
          variant="accent"
          onClick={handleSubmit}
          disabled={!text.trim() || disabled || phraseCount >= maxPhrases}
          className="absolute bottom-3 right-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Definitions and example sentences will be auto-generated for each phrase.
      </p>
    </div>
  );
}
