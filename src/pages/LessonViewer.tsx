import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { getLessons } from "@/lib/lessonsService";
import { Lesson } from "@/types";

export default function LessonViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const lessons = await getLessons();
                const found = lessons.find(l => l.id === id);
                setLesson(found || null);
            } catch (error) {
                console.error("Error fetching lesson:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Header />
                <main className="container mx-auto flex max-w-5xl flex-1 items-center justify-center px-4 py-8">
                    <p className="text-muted-foreground">Loading lesson...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Header />
                <main className="container mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 py-8">
                    <h2 className="text-2xl font-bold">Lesson not found</h2>
                    <Button className="mt-4" onClick={() => navigate("/online-lessons")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lessons
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />

            <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/online-lessons")}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Lessons
                </Button>

                <div className="space-y-6">
                    {/* Title and Description */}
                    <div>
                        <h1 className="text-3xl font-bold">{lesson.title}</h1>
                        {lesson.description && (
                            <p className="mt-2 text-muted-foreground">{lesson.description}</p>
                        )}
                    </div>

                    {/* Video Player */}
                    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
                        {lesson.videoUrl ? (
                            <video
                                controls
                                className="h-full w-full"
                                src={lesson.videoUrl}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : lesson.embedLink ? (
                            <iframe
                                src={lesson.embedLink}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-white">
                                No video available
                            </div>
                        )}
                    </div>

                    {/* PDF Attachments */}
                    {lesson.pdfUrls && lesson.pdfUrls.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold">Attachments</h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {lesson.pdfUrls.map((url, index) => {
                                    const fileName = url.split('/').pop() || `Document ${index + 1}`;
                                    return (
                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                                        >
                                            <span className="font-medium">PDF {index + 1}</span>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
