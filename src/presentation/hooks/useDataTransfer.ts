"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { SheetKind } from "@/core/domain/entities/DataTransfer";
import type { IDataTransferService } from "@/core/domain/services/IDataTransferService";

function getService() {
  return container.resolve<IDataTransferService>("dataTransferService");
}

export function useSheetDownload() {
  return useMutation({
    mutationFn: ({ kind, what }: { kind: SheetKind; what: "template" | "export" }) =>
      getService().download(kind, what),
  });
}

export function useImportPreview() {
  return useMutation({
    mutationFn: ({ kind, file }: { kind: SheetKind; file: File }) =>
      getService().preview(kind, file),
  });
}

export function useImportCommit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, file }: { kind: SheetKind; file: File }) =>
      getService().commit(kind, file),
    // Whatever list was on screen now holds different rows.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
