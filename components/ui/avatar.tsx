"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"
import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, "src"> {
  src?: string | null
}

function AvatarImage({ className, src, alt, ...props }: AvatarImageProps) {
  if (!src) return null

  return (
    <div className={cn("relative aspect-square size-full", className)}>
      <Image
        src={src}
        alt={alt ?? "Avatar"}
        fill
        sizes="32px"
        loading="lazy"
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = "none"
        }}
        {...props}
      />
    </div>
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }