import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { VideoEntryCard } from "@/components/VideoEntryCard";
import { getPhraseBox, removeFromPhraseBox } from "@/lib/storage";
import { VideoEntry } from "@/types";
import { Library } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PhraseBox() {
  const [entries, setEntries] = useState<VideoEntry[]>([]);

  useEffect(() => {
    setEntries(getPhraseBox());
  }, []);

  const handleRemove = (id: string) => {
    removeFromPhraseBox(id);
    setEntries(getPhraseBox());
    toast({
      title: "Removed",
      description: "Entry removed from your Phrase Box",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Phrase Box
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your saved videos and phrases for review
          </p>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <VideoEntryCard
                key={entry.id}
                entry={entry}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Library className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
              No Saved Videos
            </h3>
            <p className="mt-2 text-muted-foreground">
              Start studying videos and save them here for future review
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
