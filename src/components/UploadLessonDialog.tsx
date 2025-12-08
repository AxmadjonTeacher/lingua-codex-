import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Upload, Link as LinkIcon, FileText, X } from "lucide-react";
import { uploadVideo, uploadPDF, createLesson } from "@/lib/lessonsService";
import { toast } from "@/hooks/use-toast";

interface UploadLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userEmail: string;
    onSuccess?: () => void;
}

export function UploadLessonDialog({
    open,
    onOpenChange,
    userEmail,
    onSuccess,
}: UploadLessonDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoSource, setVideoSource] = useState<"upload" | "embed">("upload");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [embedLink, setEmbedLink] = useState("");
    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("video/")) {
            setVideoFile(file);
        } else {
            toast({
                title: "Invalid file",
                description: "Please select a valid video file (mp4, webm, etc.)",
                variant: "destructive",
            });
        }
    };

    const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validPdfs = files.filter(file => file.type === "application/pdf");

        if (validPdfs.length !== files.length) {
            toast({
                title: "Invalid files",
                description: "Only PDF files are allowed",
                variant: "destructive",
            });
        }

        setPdfFiles(prev => [...prev, ...validPdfs]);
    };

    const removePdf = (index: number) => {
        setPdfFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            toast({
                title: "Title required",
                description: "Please enter a lesson title",
                variant: "destructive",
            });
            return;
        }

        if (videoSource === "upload" && !videoFile) {
            toast({
                title: "Video required",
                description: "Please select a video file to upload",
                variant: "destructive",
            });
            return;
        }

        if (videoSource === "embed" && !embedLink.trim()) {
            toast({
                title: "Embed link required",
                description: "Please enter a video embed link",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            let videoUrl: string | undefined;
            let finalEmbedLink: string | undefined;

            // Upload video or use embed link
            if (videoSource === "upload" && videoFile) {
                setUploadProgress(20);
                videoUrl = await uploadVideo(videoFile, (progress) => {
                    setUploadProgress(20 + progress * 0.4);
                });
                setUploadProgress(60);
            } else {
                finalEmbedLink = embedLink;
                setUploadProgress(60);
            }

            // Upload PDFs
            const pdfUrls: string[] = [];
            if (pdfFiles.length > 0) {
                for (let i = 0; i < pdfFiles.length; i++) {
                    const url = await uploadPDF(pdfFiles[i]);
                    pdfUrls.push(url);
                    setUploadProgress(60 + ((i + 1) / pdfFiles.length) * 30);
                }
            }

            setUploadProgress(90);

            // Create lesson
            await createLesson({
                title: title.trim(),
                description: description.trim() || undefined,
                videoUrl,
                embedLink: finalEmbedLink,
                pdfUrls: pdfUrls.length > 0 ? pdfUrls : undefined,
                createdBy: userEmail,
            });

            setUploadProgress(100);

            toast({
                title: "Success!",
                description: "Lesson uploaded successfully",
            });

            // Reset form
            setTitle("");
            setDescription("");
            setVideoFile(null);
            setEmbedLink("");
            setPdfFiles([]);
            setUploadProgress(0);

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload lesson",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload New Lesson</DialogTitle>
                    <DialogDescription>
                        Add a new video lesson with optional PDF attachments
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Enter lesson title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter lesson description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading}
                            rows={3}
                        />
                    </div>

                    {/* Video Source */}
                    <div className="space-y-2">
                        <Label>Video Source *</Label>
                        <RadioGroup
                            value={videoSource}
                            onValueChange={(value) => setVideoSource(value as "upload" | "embed")}
                            disabled={uploading}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="upload" id="upload" />
                                <Label htmlFor="upload" className="font-normal cursor-pointer">
                                    Upload video file
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="embed" id="embed" />
                                <Label htmlFor="embed" className="font-normal cursor-pointer">
                                    Embed link (YouTube, Vimeo, etc.)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Video Upload or Embed */}
                    {videoSource === "upload" ? (
                        <div className="space-y-2">
                            <Label htmlFor="video-file">Video File</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="video-file"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoFileChange}
                                    disabled={uploading}
                                />
                                {videoFile && (
                                    <span className="text-sm text-muted-foreground">
                                        {videoFile.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="embed-link">Embed Link</Label>
                            <Input
                                id="embed-link"
                                placeholder="https://www.youtube.com/embed/..."
                                value={embedLink}
                                onChange={(e) => setEmbedLink(e.target.value)}
                                disabled={uploading}
                            />
                        </div>
                    )}

                    {/* PDF Attachments */}
                    <div className="space-y-2">
                        <Label htmlFor="pdf-files">PDF Attachments (Optional)</Label>
                        <Input
                            id="pdf-files"
                            type="file"
                            accept="application/pdf"
                            multiple
                            onChange={handlePdfFileChange}
                            disabled={uploading}
                        />
                        {pdfFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {pdfFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-md border p-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm">{file.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePdf(index)}
                                            disabled={uploading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <Label>Upload Progress</Label>
                            <Progress value={uploadProgress} />
                            <p className="text-sm text-muted-foreground">
                                {uploadProgress}% complete
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload Lesson"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
