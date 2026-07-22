"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";

const VISION_LOGO_SRC = "/logo.svg";

function resolveProductImageSrc(value: string | null | undefined): string {
  const imageUrl = value?.trim();
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:") || /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }
  return resolveMediaUrl(imageUrl);
}

interface ProductCardImageProps {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  logoClassName?: string;
}

export function ProductCardImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  logoClassName,
}: ProductCardImageProps) {
  const resolvedSrc = resolveProductImageSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = !resolvedSrc || failedSrc === resolvedSrc;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center bg-mint/5 p-5 dark:bg-mint/10">
          <Image
            src={VISION_LOGO_SRC}
            alt="Vision AI POS logo"
            width={80}
            height={80}
            className={cn("h-auto w-16 object-contain opacity-80", logoClassName)}
            unoptimized
          />
        </div>
      ) : (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          className={cn("object-contain", imageClassName)}
          sizes={sizes}
          onError={() => setFailedSrc(resolvedSrc)}
          unoptimized
        />
      )}
    </div>
  );
}
