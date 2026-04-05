"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { resolveMediaUrl } from "@/lib/media-url";
import { useUploads } from "@/presentation/hooks/useUploads";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import type { UploadedFile } from "@/core/domain/entities/UploadedFile";

function previewSrcFromValue(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return resolveMediaUrl(v);
}

function isImageUpload(file: UploadedFile): boolean {
  if (file.mimeType && file.mimeType.toLowerCase().startsWith("image/")) {
    return true;
  }
  const candidate = `${file.originalName} ${file.url}`.toLowerCase();
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|#|$)/i.test(candidate);
}

export interface ProductImageFieldProps {
  value: string;
  onChange: (next: string) => void;
  id?: string;
}

const PAGE_SIZE = 24;

export function ProductImageField({ value, onChange, id = "product-image-file" }: ProductImageFieldProps) {
  const previewSrc = previewSrcFromValue(value);
  const toast = useToast();
  const { activeBranch, isSystemAdmin } = usePermissions();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error, refetch } = useUploads({
    page,
    limit: PAGE_SIZE,
    folder: "products",
    branchId: activeBranch ?? undefined,
  });

  const imageItems = useMemo(
    () => (data?.items ?? []).filter(isImageUpload),
    [data?.items]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return imageItems;
    return imageItems.filter((item) => {
      return (
        item.originalName.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    });
  }, [imageItems, search]);

  const total = data?.total;
  const hasPrev = page > 1;
  const hasNext =
    total != null ? page * PAGE_SIZE < total : (data?.items?.length ?? 0) === PAGE_SIZE;

  const onSelect = (url: string) => {
    onChange(url);
    setPickerOpen(false);
    toast.success("Image selected.");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Product image</Label>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
          {previewSrc ? (
            <>
              <Image
                src={previewSrc}
                alt=""
                fill
                className="object-contain p-1"
                sizes="144px"
                unoptimized
              />
            </>
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
              No image selected
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Choose from uploads
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
      <p className="text-xs text-muted">
        Product images are selected from the system upload library (<code className="text-xs">products</code> folder).
      </p>
      {!isSystemAdmin && !activeBranch ? (
        <p className="text-xs text-amber-600">
          Select an active branch to view branch-specific uploaded images.
        </p>
      ) : null}

      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) {
            setSearch("");
            setPage(1);
          }
        }}
      >
        <DialogContent maxWidth="2xl" className="w-[calc(100vw-2rem)] p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Select Product Image</DialogTitle>
            <DialogDescription>
              Choose an existing image uploaded to the <code>products</code> folder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-6 pt-4">
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by file name or URL on this page..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          <div className="min-h-56 max-h-[55vh] overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex h-44 items-center justify-center text-sm text-muted">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading uploaded images...
              </div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load uploaded images.
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-muted">
                No images found on this page.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item) => {
                  const src = previewSrcFromValue(item.url);
                  const selected = value.trim() === item.url.trim();
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.url)}
                      className={`overflow-hidden rounded-md border text-left transition-colors ${
                        selected
                          ? "border-mint ring-2 ring-mint/40"
                          : "border-border hover:border-mint/60"
                      }`}
                    >
                      <div className="relative aspect-square bg-muted/20">
                        <Image
                          src={src}
                          alt={item.originalName || "Uploaded image"}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                          unoptimized
                        />
                      </div>
                      <div className="space-y-1 px-2 py-2">
                        <p className="truncate text-xs font-medium">
                          {item.originalName || "Untitled image"}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {item.url}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border px-6 py-3">
            <div className="mr-auto text-xs text-muted">
              {total != null ? `Total files: ${total}` : null}
              {total != null ? ` | Page ${page}` : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPrev || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNext || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPickerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
