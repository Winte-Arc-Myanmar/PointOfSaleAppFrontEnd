"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IUploadService } from "@/core/domain/services/IUploadService";
import type { GetUploadsParams } from "@/core/domain/repositories/IUploadRepository";

const UPLOADS_QUERY_KEY = ["uploads"];

export function useUploads(params?: GetUploadsParams) {
  return useQuery({
    queryKey: [
      ...UPLOADS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.folder,
      params?.branchId,
    ],
    queryFn: () => {
      const service = container.resolve<IUploadService>("uploadService");
      return service.getAll(params);
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      folder,
      branchId,
    }: {
      file: File;
      folder?: string;
      branchId?: string;
    }) => {
      const service = container.resolve<IUploadService>("uploadService");
      return service.uploadFile(file, folder, branchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOADS_QUERY_KEY });
    },
  });
}

export function useUploadMultipleFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      files,
      folder,
      branchId,
    }: {
      files: File[];
      folder?: string;
      branchId?: string;
    }) => {
      const service = container.resolve<IUploadService>("uploadService");
      return service.uploadMultiple(files, folder, branchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOADS_QUERY_KEY });
    },
  });
}

export function useDeleteUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => {
      const service = container.resolve<IUploadService>("uploadService");
      return service.delete(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOADS_QUERY_KEY });
    },
  });
}
