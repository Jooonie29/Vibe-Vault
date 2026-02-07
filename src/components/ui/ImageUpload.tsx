import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    onUploadComplete: (storageId: string) => void;
    onClear: () => void;
    className?: string;
    label?: string;
}

export function ImageUpload({ onUploadComplete, onClear, className, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        // Show local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            // 1. Get a short-lived upload URL
            const postUrl = await generateUploadUrl();

            // 2. POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error("Upload failed");

            const { storageId } = await result.json();
            onUploadComplete(storageId);
        } catch (error) {
            console.error("Upload error:", error);
            setPreview(null);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setPreview(null);
        onClear();
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <div className="relative group">
                {preview ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={handleClear}
                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-colors"
                                title="Remove image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center mb-3">
                                <Upload className="w-5 h-5" />
                            </div>
                            <p className="mb-1 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                                Click to upload cover
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG or WEBP (MAX. 800x400px)
                            </p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
