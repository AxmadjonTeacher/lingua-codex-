import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SessionCard } from "@/components/SessionCard";
import { NewSessionDialog } from "@/components/NewSessionDialog";
import { Button } from "@/components/ui/button";
import { getSessions, saveSession, deleteSession } from "@/lib/storage";
import { Session } from "@/types";
import { Plus, PlayCircle, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Index() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async (title: string, youtubeUrl: string, youtubeId: string) => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      title,
      youtubeUrl,
      youtubeId,
      notes: "",
      phrases: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveSession(newSession);
    navigate(`/session/${newSession.id}`);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    await loadSessions();
    toast({
      title: "Session deleted",
      description: "Your session has been removed",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : (
          <>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Codex</h1>
            <p className="mt-1 text-muted-foreground">
              Continue learning where you left off
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/my-phrases")}>
              <BookOpen className="mr-2 h-4 w-4" />
              My Phrases
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        {sessions.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        ) : (
          <div className="card-dashed flex flex-col items-center justify-center px-8 py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <PlayCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No sessions yet</h3>
            <p className="mt-1 text-center text-muted-foreground">
              Create your first session by pasting a YouTube<br />
              URL to start building your Lingua Codex.
            </p>
          </div>
        )}
          </>
        )}
      </main>

      <Footer />

      <NewSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}
