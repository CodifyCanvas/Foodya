"use client";

import { useState, useEffect } from "react";
import { Control, Controller } from "react-hook-form";
import Dropzone from "react-dropzone";
import Image from "next/image";
import { XCircleIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
    control: Control<any>;
    name: string;
    label?: string;
    defaultValue?: File | null;
    allowedTypes?: string[];
    currentImageUrl?: string;
    className?: string;
    imageClassName?: string;
}

export function ImagePicker({
    control,
    name,
    label,
    defaultValue = null,
    allowedTypes = ["png", "jpg", "jpeg", "webp"],
    currentImageUrl,
    className,
    imageClassName
}: ImagePickerProps) {

    // === State for selected file and preview URL ===
    const [file, setFile] = useState<File | null>(defaultValue);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        currentImageUrl || null
    );

    // === Generate preview URL whenever file changes ===
    useEffect(() => {
        if (!file) {
            setPreviewUrl(currentImageUrl || null)
            return
        }

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // === Cleanup URL object on unmount / file change ===
        return () => URL.revokeObjectURL(url)
    }, [file, currentImageUrl]);

    // === Render Dropzone for selecting new image ===
    const renderDropzone = (field: any) => (
        <Dropzone
            onDrop={(acceptedFiles) => {
                if (acceptedFiles.length > 0) {
                    setFile(acceptedFiles[0]);
                    field.onChange(acceptedFiles[0]);
                }
            }}
            accept={allowedTypes.reduce((acc, ext) => {
                acc[`image/${ext}`] = [`.${ext}`];
                return acc;
            }, {} as Record<string, string[]>)}
            maxFiles={1}
        >
            {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border border-dashed flex items-center justify-center aspect-square rounded-md focus:outline-none",
                        "border-neutral-400",
                        isDragActive && isDragAccept && "border-primary bg-secondary",
                        isDragActive && isDragReject && "border-destructive bg-destructive/20",
                        className
                    )}
                >
                    <input {...getInputProps()} />
                    <ImageIcon className="h-16 w-16" strokeWidth={1.25} />
                </div>
            )}
        </Dropzone>
    );

    // === Render Preview of selected / current image ===
    const renderPreview = (field: any) => (
        <div className={cn("relative aspect-square", className)}>
            <button
                type="button"
                className="absolute z-10 cursor-pointer top-0 right-0 translate-x-1/2 -translate-y-1/2"
                onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    field.onChange(null);
                }}
            >
                <XCircleIcon className="h-5 w-5 text-white fill-red-500" />
            </button>
            <Image
                src={previewUrl!}
                alt="Image Preview"
                fill
                sizes="(min-width: 640px) 160px, 96px"
                className={cn("border border-border h-full w-full object-cover", imageClassName)}
            />
        </div>
    );

    // === Main render with React Hook Form Controller ===
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field }) => (
                <div className="w-full">
                    {label && (
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {label}
                        </label>
                    )}
                    {previewUrl ? renderPreview(field) : renderDropzone(field)}
                </div>
            )}
        />
    );
}