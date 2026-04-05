"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { resolveMediaUrl } from "@/lib/media-url";
import { useUploadFile } from "@/presentation/hooks/useUploads";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePermissions } from "@/presentation/hooks/usePermissions";

function previewSrcFromValue(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
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
  const uploadFile = useUploadFile();
  const toast = useToast();
  const { activeBranch } = usePermissions();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    uploadFile.mutate(
      { file, folder: "products", branchId: activeBranch ?? undefined },
      {
        onSuccess: (uploaded) => {
          onChange(uploaded.url);
          setLocalPreview(null);
          URL.revokeObjectURL(objectUrl);
          toast.success("Image uploaded.");
        },
        onError: () => {
          setLocalPreview(null);
          URL.revokeObjectURL(objectUrl);
          toast.error("Image upload failed.");
        },
      }
    );
  };

  const displaySrc = localPreview ?? previewSrc;
  const uploading = uploadFile.isPending;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Product image</Label>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
          {displaySrc ? (
            <>
              <Image
                src={displaySrc}
                alt=""
                fill
                className="object-contain p-1"
                sizes="144px"
                unoptimized
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-6 w-6 animate-spin text-muted" />
                </div>
              )}
            </>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading…" : "Choose image"}
          </Button>
          {value && !uploading ? (
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
      <p className="text-xs text-muted">
        PNG, JPG, WebP, or GIF. Uploaded to the <code className="text-xs">products</code> folder.
      </p>
    </div>
  );
}
