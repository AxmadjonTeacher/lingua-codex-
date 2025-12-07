import { useState } from "react";
import { Phrase } from "@/types";
import { Plus, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playPCM } from "@/lib/audioService";

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

  const handlePlayAudio = async (audioData?: string) => {
    if (audioData) {
      await playPCM(audioData);
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
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">"{phrase.text}"</p>
                  {phrase.audioData && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePlayAudio(phrase.audioData)}
                      className="h-6 px-2 text-primary hover:text-primary/80"
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                  )}
                </div>
                {phrase.definition && (
                  <p className="mt-1 text-sm italic text-muted-foreground">{phrase.definition}</p>
                )}
                {phrase.examples && phrase.examples.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {phrase.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
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
