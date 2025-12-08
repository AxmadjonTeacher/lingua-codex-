import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/adminUtils";
import { getLessons, deleteLesson } from "@/lib/lessonsService";
import { Lesson } from "@/types";
import { LessonCard } from "@/components/LessonCard";
import { UploadLessonDialog } from "@/components/UploadLessonDialog";
import { toast } from "@/hooks/use-toast";

export default function OnlineLessons() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    useEffect(() => {
        // Get current user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ? { email: session.user.email || '' } : null);
        });

        // Load lessons
        loadLessons();
    }, []);

    const loadLessons = async () => {
        try {
            const data = await getLessons();
            setLessons(data);
        } catch (error) {
            console.error("Error loading lessons:", error);
            toast({
                title: "Error",
                description: "Failed to load lessons",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) {
            return;
        }

        try {
            await deleteLesson(id);
            toast({
                title: "Success",
                description: "Lesson deleted successfully",
            });
            loadLessons();
        } catch (error) {
            console.error("Error deleting lesson:", error);
            toast({
                title: "Error",
                description: "Failed to delete lesson",
                variant: "destructive",
            });
        }
    };

    const userIsAdmin = isAdmin(user?.email);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />

            <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Online Lessons</h1>
                        <p className="mt-1 text-muted-foreground">
                            Watch video lessons and download resources
                        </p>
                    </div>

                    {userIsAdmin && (
                        <Button onClick={() => setUploadDialogOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Lesson
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-muted-foreground">Loading lessons...</p>
                    </div>
                ) : lessons.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {lessons.map((lesson) => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                userEmail={user?.email}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <h2 className="text-2xl font-medium text-foreground sm:text-3xl" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                            No lessons uploaded yet!
                        </h2>
                        {!userIsAdmin && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="mt-6 border-2 border-foreground bg-background font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => navigate("/")}
                                style={{ fontFamily: 'Patrick Hand, cursive' }}
                            >
                                Go back to dashboard
                            </Button>
                        )}
                    </div>
                )}
            </main>

            <Footer />

            {userIsAdmin && user && (
                <UploadLessonDialog
                    open={uploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                    userEmail={user.email}
                    onSuccess={loadLessons}
                />
            )}
        </div>
    );
}
