import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    recommendedDimensions?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className, recommendedDimensions }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
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
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={removeImage}
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
                                <ImageIcon size={24} />
                                <span className="text-[10px] mt-1">Upload</span>
                            </>
                        )}
                    </div>
                )}

                <div className="flex-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
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
                                {value ? 'Change Image' : 'Select Image'}
                            </>
                        )}
                    </Button>
                    {recommendedDimensions && (
                        <p className="text-[10px] text-gray-400 mt-1">
                            Recommended: {recommendedDimensions}
                        </p>
                    )}
                    {value && (
                        <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[200px]">
                            {value}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export { ImageUpload };
