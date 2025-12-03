import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { PhraseBox } from "@/components/PhraseBox";
import { Notepad } from "@/components/Notepad";
import { FlashcardReview } from "@/components/FlashcardReview";
import { Button } from "@/components/ui/button";
import { getSession, saveSession } from "@/lib/storage";
import { createPhrase, enrichPhraseWithAI } from "@/lib/phrases";
import { Session } from "@/types";
import { GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MAX_PHRASES = 35;

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getSession(id);
      if (found) {
        setSession(found);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  const updateSession = useCallback((updates: Partial<Session>) => {
    if (!session) return;
    const updated = { ...session, ...updates };
    setSession(updated);
    saveSession(updated);
  }, [session]);

  const handleNotesChange = useCallback((notes: string) => {
    updateSession({ notes });
  }, [updateSession]);

  const handleAddPhrase = useCallback(async (text: string) => {
    if (!session) return;
    if (session.phrases.length >= MAX_PHRASES) {
      toast({
        title: "Limit reached",
        description: `Maximum ${MAX_PHRASES} phrases allowed`,
        variant: "destructive",
      });
      return;
    }
    const newPhrase = createPhrase(text);
    const updatedPhrases = [...session.phrases, newPhrase];
    updateSession({ phrases: updatedPhrases });
    
    toast({
      title: "Phrase added",
      description: "Generating AI definition...",
    });

    // Enrich with AI in background
    const enrichedPhrase = await enrichPhraseWithAI(newPhrase);
    const finalPhrases = updatedPhrases.map(p => 
      p.id === enrichedPhrase.id ? enrichedPhrase : p
    );
    updateSession({ phrases: finalPhrases });
  }, [session, updateSession]);

  const handleRemovePhrase = useCallback((phraseId: string) => {
    if (!session) return;
    updateSession({ phrases: session.phrases.filter((p) => p.id !== phraseId) });
  }, [session, updateSession]);

  if (!session) {
    return null;
  }

  if (showFlashcards) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-8">
          <FlashcardReview
            phrases={session.phrases}
            onClose={() => setShowFlashcards(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 gap-0 overflow-hidden">
        {/* Left Panel - Video & Phrases */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="p-4">
            <YouTubePlayer videoId={session.youtubeId} title={session.title} />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            <PhraseBox
              phrases={session.phrases}
              onAddPhrase={handleAddPhrase}
              onRemovePhrase={handleRemovePhrase}
              maxPhrases={MAX_PHRASES}
            />
            
            <Button
              variant="outline"
              onClick={() => setShowFlashcards(true)}
              disabled={session.phrases.length === 0}
              className="mt-4 w-full"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Study Flashcards ({session.phrases.length})
            </Button>
          </div>
        </div>

        {/* Right Panel - Notes */}
        <div className="hidden h-[calc(100vh-56px)] w-1/2 border-l border-border p-4 lg:block">
          <Notepad value={session.notes} onChange={handleNotesChange} />
        </div>
      </main>
    </div>
  );
}
