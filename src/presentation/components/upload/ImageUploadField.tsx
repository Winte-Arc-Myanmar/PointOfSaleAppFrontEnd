"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { useUploadFile } from "@/presentation/hooks/useUploads";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { resolveMediaUrl } from "@/lib/media-url";

function previewSrc(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return resolveMediaUrl(trimmed);
}

export interface ImageUploadFieldProps {
  value?: string;
  onChange: (next: string) => void;
  id?: string;
  label?: string;
  folder?: string;
  disabled?: boolean;
  error?: string;
}

export function ImageUploadField({
  value,
  onChange,
  id = "image-upload",
  label = "Avatar",
  folder = "users",
  disabled = false,
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFile();
  const toast = useToast();
  const { activeBranch } = usePermissions();
  const src = previewSrc(value ?? "");
  const busy = upload.isPending;
  const hasImage = Boolean(value?.trim());

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    upload.mutate(
      {
        file,
        folder,
        branchId: activeBranch ?? undefined,
      },
      {
        onSuccess: (uploaded) => {
          onChange(uploaded.url);
          toast.success("Image uploaded.");
        },
        onError: () => toast.error("Image upload failed."),
      },
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted/30">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-muted">
              No image
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
            disabled={disabled || busy}
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            {busy ? "Uploading..." : hasImage ? "Change image" : "Upload image"}
          </Button>
          {hasImage ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={disabled || busy}
              onClick={() => onChange("")}
            >
              <X className="mr-2 h-4 w-4" />
              Remove image
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted">
        Upload a photo. It is stored in the <code className="text-xs">{folder}</code> folder
        and sent as the avatar URL.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
