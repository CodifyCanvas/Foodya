"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Dropzone from "react-dropzone";
import Image from "next/image";
import { XCircleIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";



interface ImagePickerProps<TFieldValues extends FieldValues = FieldValues> {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    label?: string;
    defaultValue?: File | null;
    allowedTypes?: string[];
    currentImageUrl?: string;
    className?: string;
    imageClassName?: string;
}


/**
 * === Optimized image picker with preview and React Hook Form integration. ===
 * 
 * Allows users to upload an image via drag-and-drop or file selection, 
 * displays a preview of the selected or current image, and integrates with `react-hook-form`.
 * Supports file type restrictions and clearing the selected image.
 *
 * @param control - React Hook Form control object for form management.
 * @param name - Name of the form field (type-safe based on form schema).
 * @param label - Optional label displayed above the picker.
 * @param defaultValue - Optional initial File value (default: null).
 * @param allowedTypes - Array of allowed file extensions (default: ["png","jpg","jpeg","webp"]).
 * @param currentImageUrl - Optional URL of an existing image to display initially.
 * @param className - Optional custom class names for the wrapper element.
 * @param imageClassName - Optional custom class names for the preview image.
 * @returns {JSX.Element} A controlled image upload component with preview and clear functionality.
 *
 * @example
 * <ImagePicker
 *   control={control}
 *   name="profilePicture"
 *   label="Upload your profile picture"
 *   allowedTypes={["png","jpg"]}
 *   currentImageUrl={user.avatarUrl}
 * />
 */
export function ImagePicker<TFieldValues extends FieldValues = FieldValues>({
    control,
    name,
    label,
    defaultValue = null,
    allowedTypes = ["png", "jpg", "jpeg", "webp"],
    currentImageUrl,
    className,
    imageClassName
}: ImagePickerProps<TFieldValues>): React.JSX.Element {

    // === State for selected file and preview URL ===
    const [file, setFile] = useState<File | null>(defaultValue);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        currentImageUrl || null
    );

    // === Memoize accept object to prevent unnecessary recreations ===
    const acceptedFileTypes = useMemo(() =>
        allowedTypes.reduce((acc, ext) => {
            acc[`image/${ext}`] = [`.${ext}`];
            return acc;
        }, {} as Record<string, string[]>),
        [allowedTypes]
    );

    // === Generate preview URL whenever file changes ===
    useEffect(() => {
        if (!file) {
            setPreviewUrl(currentImageUrl || null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // === Cleanup URL object on unmount / file change ===
        return () => URL.revokeObjectURL(url);
    }, [file, currentImageUrl]);

    // === Memoized handlers to prevent unnecessary re-renders ===
    const handleDrop = useCallback(
        (acceptedFiles: File[], onChange: (value: File | null) => void) => {
            if (acceptedFiles.length > 0) {
                const selectedFile = acceptedFiles[0];
                setFile(selectedFile);
                onChange(selectedFile);
            }
        },
        []
    );

    const handleClear = useCallback(
        (onChange: (value: File | null) => void) => {
            setFile(null);
            setPreviewUrl(null);
            onChange(null);
        },
        []
    );

    // === Render Dropzone for selecting new image ===
    const renderDropzone = useCallback(
        (onChange: (value: File | null) => void) => (
            <Dropzone
                onDrop={(acceptedFiles: File[]) => handleDrop(acceptedFiles, onChange)}
                accept={acceptedFileTypes}
                maxFiles={1}
                multiple={false}
            >
                {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border border-dashed flex items-center justify-center aspect-square rounded-md focus:outline-none cursor-pointer transition-colors",
                            "border-neutral-400 hover:border-primary/50",
                            isDragActive && isDragAccept && "border-primary bg-secondary",
                            isDragActive && isDragReject && "border-destructive bg-destructive/20",
                            className
                        )}
                    >
                        <input {...getInputProps()} />
                        <ImageIcon className="h-16 w-16 text-muted-foreground" strokeWidth={1.25} />
                    </div>
                )}
            </Dropzone>
        ),
        [acceptedFileTypes, className, handleDrop]
    );

    // === Render Preview of selected / current image ===
    const renderPreview = useCallback(
        (onChange: (value: File | null) => void) => (
            <div className={cn("relative aspect-square", className)}>
                <button
                    type="button"
                    className="absolute z-10 cursor-pointer top-0 right-0 translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    onClick={() => handleClear(onChange)}
                    aria-label="Remove image"
                >
                    <XCircleIcon className="h-5 w-5 text-white fill-red-500" />
                </button>
                <Image
                    src={previewUrl!}
                    alt="Image Preview"
                    fill
                    sizes="(min-width: 640px) 160px, 96px"
                    className={cn("border border-border h-full w-full object-cover", imageClassName)}
                    priority={false}
                    loading="lazy"
                />
            </div>
        ),
        [className, imageClassName, previewUrl, handleClear]
    );

    // === Main render with React Hook Form Controller ===
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div className="w-full">
                    {label && (
                        <label
                            htmlFor={`${name}-input`}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            {label}
                        </label>
                    )}
                    {previewUrl ? renderPreview(field.onChange) : renderDropzone(field.onChange)}
                </div>
            )}
        />
    );
}

// === Add display name for better debugging ===
ImagePicker.displayName = "ImagePicker";