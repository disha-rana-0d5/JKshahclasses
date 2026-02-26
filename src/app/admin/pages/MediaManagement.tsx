import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Upload, Copy, Check, Image as ImageIcon, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

import { BASE_URL } from "../../api/api";

interface UploadedFile {
    _id?: string;
    url: string;
    name: string;
    type: "image" | "file";
    createdAt?: string;
}

export function MediaManagement() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to construct full URL
    const getFullUrl = (relativePath: string) => {
        let serverRoot = BASE_URL;

        // If BASE_URL ends with /api, remove it to get the server root for static files
        if (BASE_URL.endsWith('/api')) {
            serverRoot = BASE_URL.slice(0, -4);
        }

        // Ensure path starts with /
        const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        return `${serverRoot}${path}`;
    };

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/upload`);
            if (!response.ok) throw new Error("Failed to fetch media");

            const data = await response.json();

            const formattedMedia = data.map((item: any) => ({
                _id: item._id,
                url: getFullUrl(item.url), // Add server root to stored relative URL
                name: item.name,
                type: item.type,
                createdAt: item.createdAt
            }));

            setUploadedFiles(formattedMedia);
        } catch (error) {
            console.error("Error fetching media:", error);
            toast.error("Failed to load media library");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleUpload = async (acceptedFiles: File[]) => {
        setIsUploading(true);
        const token = localStorage.getItem("token");

        for (const file of acceptedFiles) {
            const formData = new FormData();
            const isImage = file.type.startsWith("image/");
            formData.append(isImage ? "image" : "file", file);

            try {
                const endpoint = isImage
                    ? `${BASE_URL}/upload`
                    : `${BASE_URL}/upload/file`;

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Upload failed");
                }

                const data = await response.json();

                const fullUrl = getFullUrl(data.url);

                setUploadedFiles(prev => [{
                    _id: data.media?._id, // Get ID from response if available
                    url: fullUrl,
                    name: file.name,
                    type: isImage ? "image" : "file",
                    createdAt: new Date().toISOString()
                }, ...prev]);

                toast.success(`Successfully uploaded ${file.name}`);
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }
        setIsUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleUpload,
        accept: {
            'image/*': [],
            'application/pdf': []
        }
    });

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const response = await fetch(`${BASE_URL}/upload/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete media");

            setUploadedFiles(prev => prev.filter(file => file._id !== id));
            toast.success("Media deleted successfully");
        } catch (error) {
            console.error("Error deleting media:", error);
            toast.error("Failed to delete media");
        }
    };

    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                toast.success("URL copied to clipboard!");
            } else {
                toast.error("Failed to copy URL");
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            toast.error("Failed to copy URL");
        }

        document.body.removeChild(textArea);
    };

    const copyToClipboard = (text: string) => {
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            toast.success("URL copied to clipboard!");
        }, (err) => {
            console.error('Async: Could not copy text: ', err);
            fallbackCopyTextToClipboard(text);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                <Button variant="outline" onClick={fetchMedia} disabled={isLoading}>
                    Refresh
                </Button>
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-lg font-medium">
                            {isDragActive ? "Drop the files here" : "Drag & drop files here, or click to select"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Supports Images (PNG, JPG, WEBP) and Documents (PDF)
                        </p>
                    </div>
                    <Button disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Select Files"}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Media Files ({uploadedFiles.length})</h2>

                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading media...</div>
                ) : uploadedFiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg border border-border shadow-sm flex items-center gap-4 relative group">
                                <div className="h-16 w-16 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                                    {file.type === "image" ? (
                                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <FileText className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-muted-foreground truncate" title={file.url}>{file.url}</p>
                                    {file.createdAt && (
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => copyToClipboard(file.url)}
                                        title="Copy URL"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    {file._id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(file._id!, file.name)}
                                            title="Delete"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-lg">
                        No media files uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
}
