import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lesson } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Trash2, Edit } from "lucide-react";
import { isAdmin } from "@/lib/adminUtils";

interface LessonCardProps {
    lesson: Lesson;
    userEmail?: string;
    onDelete?: (id: string) => void;
    onEdit?: (lesson: Lesson) => void;
}

export function LessonCard({ lesson, userEmail, onDelete, onEdit }: LessonCardProps) {
    const navigate = useNavigate();
    const isUserAdmin = isAdmin(userEmail);

    const handleClick = () => {
        navigate(`/lesson/${lesson.id}`);
    };

    return (
        <Card className="group cursor-pointer transition-all hover:shadow-lg" onClick={handleClick}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
                        {lesson.description && (
                            <CardDescription className="mt-2 line-clamp-3">
                                {lesson.description}
                            </CardDescription>
                        )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                        {lesson.videoUrl ? (
                            <Video className="h-5 w-5 text-primary" />
                        ) : (
                            <div className="h-5 w-5 text-primary">🎬</div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {lesson.pdfUrls && lesson.pdfUrls.length > 0 && (
                        <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{lesson.pdfUrls.length} PDF{lesson.pdfUrls.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {isUserAdmin && (
                <CardFooter className="gap-2 border-t pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(lesson);
                        }}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(lesson.id);
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
