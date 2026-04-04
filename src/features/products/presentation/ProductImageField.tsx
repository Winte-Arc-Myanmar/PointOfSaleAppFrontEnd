"use client";

import { useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { resolveMediaUrl } from "@/lib/media-url";

function previewSrcFromValue(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("data:") || /^https?:\/\//i.test(v)) return v;
  return resolveMediaUrl(v);
}

export interface ProductImageFieldProps {
  value: string;
  onChange: (next: string) => void;
  id?: string;
}

export function ProductImageField({ value, onChange, id = "product-image-file" }: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewSrc = previewSrcFromValue(value);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Product image</Label>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
          {previewSrc ? (
            <Image
              src={previewSrc}
              alt=""
              fill
              className="object-contain p-1"
              sizes="144px"
              unoptimized
            />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
              No image selected
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPick}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Choose image
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange("")}
            >
              <X className="mr-2 h-4 w-4" />
              Remove image
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted">PNG, JPG, WebP, or GIF from your device.</p>
    </div>
  );
}
