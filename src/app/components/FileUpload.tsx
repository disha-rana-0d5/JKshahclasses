import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface FileUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ value, onChange, label, className, accept = ".pdf" }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload/file', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group bg-gray-50 flex items-center justify-center">
                        <a href={value} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-2 text-center">
                            <FileText className="h-8 w-8 text-red-500 mb-1" />
                            <span className="text-[10px] text-gray-600 truncate max-w-full break-all">PDF</span>
                        </a>
                        <button
                            onClick={removeFile}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors"
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <FileText size={24} />
                                <span className="text-[10px] mt-1">Upload PDF</span>
                            </>
                        )}
                    </div>
                )}

                <div className="flex-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={accept}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                {value ? 'Change File' : 'Select PDF'}
                            </>
                        )}
                    </Button>
                    {value && (
                        <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[200px]">
                            <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
                                View Uploaded File
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export { FileUpload };
