import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getSessions, saveSession } from "@/lib/storage";
import { playPCM } from "@/lib/audioService";
import { Phrase, Session } from "@/types";
import { RotateCcw, BookCheck, GraduationCap, ArrowLeft, Volume2, FolderOpen, FolderClosed, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FlashcardModal } from "@/components/FlashcardModal";
import { QuizModal } from "@/components/QuizModal";
import { toast } from "@/hooks/use-toast";

interface PhraseWithSource extends Phrase {
  sourceTitle: string;
  sessionId: string;
}

export default function MyPhrases() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      const data = await getSessions();
      setSessions(data);
      setLoading(false);
    };
    loadSessions();
  }, []);

  const phrasesBySession = useMemo(() => {
    const grouped: Record<string, { title: string; phrases: PhraseWithSource[] }> = {};
    sessions.forEach((session) => {
      if (session.phrases.length > 0) {
        grouped[session.id] = {
          title: session.title,
          phrases: session.phrases.map((phrase) => ({
            ...phrase,
            sourceTitle: session.title,
            sessionId: session.id,
          })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
        };
      }
    });
    return grouped;
  }, [sessions]);

  const allPhrases = useMemo(() => {
    return Object.values(phrasesBySession).flatMap((s) => s.phrases);
  }, [phrasesBySession]);

  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const studyPhrases = useMemo(() => {
    return allPhrases.filter((p) => p.isStudy);
  }, [allPhrases]);

  const toggleStudy = async (phraseId: string, sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const updatedPhrases = session.phrases.map((p) =>
      p.id === phraseId ? { ...p, isStudy: !p.isStudy } : p
    );
    const updatedSession = { ...session, phrases: updatedPhrases };

    await saveSession(updatedSession);
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)));
  };

  const resetAll = async () => {
    const updates = sessions.map(async (session) => {
      if (session.phrases.some(p => p.isStudy)) {
        const updatedPhrases = session.phrases.map(p => ({ ...p, isStudy: false }));
        const updatedSession = { ...session, phrases: updatedPhrases };
        await saveSession(updatedSession);
        return updatedSession;
      }
      return session;
    });

    const updatedSessions = await Promise.all(updates);
    setSessions(updatedSessions);
  };

  const handlePlayAudio = async (audioData?: string) => {
    if (audioData) {
      await playPCM(audioData);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return `${date.getDate()} ${date.toLocaleString("en-US", { month: "long" })}/${date.getFullYear()}`;
  };

  const handleDeletePhrase = async (sessionId: string, phraseId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const updatedPhrases = session.phrases.filter((p) => p.id !== phraseId);
    const updatedSession = { ...session, phrases: updatedPhrases };

    await saveSession(updatedSession);
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)));

    toast({
      title: "Phrase deleted",
      description: "The phrase has been removed from your collection",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-8">
          <p className="text-center text-muted-foreground">Loading phrases...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Phrases</h1>
            <p className="mt-1 text-muted-foreground">
              Your collection of {allPhrases.length} words.{" "}
              <span className="text-primary">{Object.values(phrasesBySession).reduce((acc, s) => acc + s.phrases.filter(p => p.isStudy).length, 0)} marked for study.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} disabled={studyPhrases.length === 0}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              className="bg-purple-500 hover:bg-purple-600"
              disabled={studyPhrases.length === 0}
              onClick={() => setShowQuiz(true)}
            >
              <BookCheck className="mr-2 h-4 w-4" />
              Quiz
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowFlashcards(true)}
              disabled={allPhrases.length === 0}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Study Flashcards
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {allPhrases.length === 0 ? (
          <div className="card-dashed flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">No phrases yet</h3>
            <p className="mt-1 text-center text-muted-foreground">
              Add phrases from your study sessions to see them here.
            </p>
            <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(phrasesBySession).map(([sessionId, { title, phrases }]) => {
              const isOpen = openFolders.has(sessionId);
              const markedCount = phrases.filter((p) => p.isStudy).length;

              return (
                <Collapsible
                  key={sessionId}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setOpenFolders((prev) => {
                      const next = new Set(prev);
                      if (open) next.add(sessionId);
                      else next.delete(sessionId);
                      return next;
                    });
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
                      {isOpen ? (
                        <FolderOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <FolderClosed className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="flex-1 font-medium text-foreground">{title}</span>
                      <span className="text-sm text-muted-foreground">
                        {phrases.length} phrase{phrases.length !== 1 ? "s" : ""}
                        {markedCount > 0 && (
                          <span className="ml-2 text-primary">({markedCount} marked)</span>
                        )}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-3 pl-4">
                      {phrases.map((phrase) => (
                        <div
                          key={phrase.id}
                          className={`rounded-xl border bg-card p-5 transition-all ${phrase.isStudy
                              ? "border-primary shadow-md"
                              : "border-border"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={phrase.isStudy || false}
                              onCheckedChange={() => toggleStudy(phrase.id, sessionId)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-foreground">{phrase.text}</h3>
                                  {phrase.audioData && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                                      onClick={() => handlePlayAudio(phrase.audioData)}
                                    >
                                      <Volume2 className="mr-1 h-4 w-4" />
                                      Play
                                    </Button>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(phrase.createdAt)}
                                </div>
                              </div>
                              {phrase.definition && (
                                <p className="mt-2 border-l-4 border-primary pl-4 text-sm italic text-foreground">
                                  {phrase.definition}
                                </p>
                              )}
                              {phrase.examples && phrase.examples.length > 0 && (
                                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                                  <ul className="space-y-1 text-sm">
                                    {phrase.examples.map((example, i) => (
                                      <li key={i} className="flex items-start gap-2 text-foreground">
                                        <span className="text-primary">•</span>
                                        {example}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="mt-3 flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePhrase(sessionId, phrase.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <FlashcardModal
        open={showFlashcards}
        onClose={() => setShowFlashcards(false)}
        phrases={allPhrases}
      />

      <QuizModal
        open={showQuiz}
        onClose={() => setShowQuiz(false)}
        phrases={studyPhrases}
      />
    </div>
  );
}
