"use client";

import { useMemo, useRef, useState } from "react";
import { Upload, Images } from "lucide-react";
import { DataTable } from "@/presentation/components/data-table";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useBranches } from "@/presentation/hooks/useBranches";
import {
  useDeleteUpload,
  useUploadFile,
  useUploadMultipleFiles,
  useUploads,
} from "@/presentation/hooks/useUploads";
import type { UploadedFile } from "@/core/domain/entities/UploadedFile";
import { getUploadsRowActions } from "./uploads-row-actions";
import { getUploadsTableColumns } from "./uploads-table-columns";

const PAGE_SIZE = 20;

export function UploadsList() {
  const toast = useToast();
  const confirm = useConfirm();
  const { activeBranch, isSystemAdmin } = usePermissions();
  const { data: branches = [] } = useBranches({ page: 1, limit: 200 });

  const [page, setPage] = useState(1);
  const [folder, setFolder] = useState("products");
  const [branchFilter, setBranchFilter] = useState<string>("__active__");

  const branchIdForQuery =
    branchFilter === "__all__"
      ? undefined
      : branchFilter === "__active__"
        ? activeBranch
        : branchFilter;

  const { data, isLoading, error, refetch } = useUploads({
    page,
    limit: PAGE_SIZE,
    folder: folder.trim() || undefined,
    branchId: branchIdForQuery?.trim() || undefined,
  });

  const items: UploadedFile[] = data?.items ?? [];
  const total = data?.total;
  const hasPrev = page > 1;
  const hasNext =
    total != null ? page * PAGE_SIZE < total : items.length === PAGE_SIZE;

  const uploadOne = useUploadFile();
  const uploadMany = useUploadMultipleFiles();
  const deleteUpload = useDeleteUpload();

  const singleInputRef = useRef<HTMLInputElement>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);

  const uploadParams = useMemo(
    () => ({
      folder: folder.trim() || undefined,
      branchId: branchIdForQuery?.trim() || undefined,
    }),
    [folder, branchIdForQuery]
  );

  const onSingleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    uploadOne.mutate(
      { file, ...uploadParams },
      {
        onSuccess: () => toast.success("File uploaded."),
        onError: () => toast.error("Upload failed."),
      }
    );
  };

  const onMultiFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length === 0) return;
    if (files.length > 10) {
      toast.error("Maximum 10 files per batch.");
      return;
    }
    uploadMany.mutate(
      { files, ...uploadParams },
      {
        onSuccess: (r) =>
          toast.success(
            r.urls.length ? `${r.urls.length} file(s) uploaded.` : "Upload complete."
          ),
        onError: () => toast.error("Upload failed."),
      }
    );
  };

  const actions = useMemo(
    () =>
      getUploadsRowActions({
        onDelete: async (row) => {
          const ok = await confirm({
            title: "Delete file",
            description: "Remove this file from storage? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteUpload.mutate(row.url, {
              onSuccess: () => toast.success("File deleted."),
              onError: () => toast.error("Failed to delete file."),
            });
          }
        },
      }),
    [confirm, deleteUpload, toast]
  );

  const columns = useMemo(() => getUploadsTableColumns(), []);

  const busy = uploadOne.isPending || uploadMany.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="grid gap-2 w-full sm:w-48">
          <Label htmlFor="upload-folder">Folder (query &amp; upload)</Label>
          <Input
            id="upload-folder"
            value={folder}
            onChange={(e) => {
              setFolder(e.target.value);
              setPage(1);
            }}
            placeholder="products"
          />
        </div>
        <div className="grid gap-2 w-full sm:w-56">
          <Label>Branch filter</Label>
          <Select
            value={branchFilter}
            onValueChange={(v) => {
              setBranchFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__active__">Active branch</SelectItem>
              {isSystemAdmin && (
                <SelectItem value="__all__">All branches</SelectItem>
              )}
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={singleInputRef}
            type="file"
            className="sr-only"
            onChange={onSingleFiles}
          />
          <input
            ref={multiInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={onMultiFiles}
          />
          <Button
            type="button"
            variant="default"
            disabled={busy}
            onClick={() => singleInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadOne.isPending ? "Uploading…" : "Upload file"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => multiInputRef.current?.click()}
          >
            <Images className="mr-2 h-4 w-4" />
            {uploadMany.isPending ? "Uploading…" : "Upload multiple (max 10)"}
          </Button>
        </div>
      </div>
      {!isSystemAdmin && !activeBranch && (
        <p className="text-sm text-amber-600">
          Select an active branch in the header so uploads use the correct branch.
        </p>
      )}

      <DataTable<UploadedFile>
        data={items}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading uploads…"
        emptyText="No files in this folder/branch."
        error={
          error
            ? {
                message: "Failed to load uploads.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={PAGE_SIZE}
      />

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between gap-4 text-sm text-muted">
          <span>
            {total != null ? `Total: ${total}` : null}
            {total != null ? ` · Page ${page}` : null}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPrev || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNext || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
