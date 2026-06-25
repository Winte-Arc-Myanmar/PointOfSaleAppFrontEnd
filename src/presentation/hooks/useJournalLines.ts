"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IJournalLineService } from "@/core/domain/services/IJournalLineService";
import type {
  GetJournalLinesParams,
  JournalLineWriteDto,
} from "@/core/domain/repositories/IJournalLineRepository";

const JOURNAL_LINES_QUERY_KEY = ["journal-lines"];

export function useJournalLines(
  journalEntryId: string | null,
  params?: GetJournalLinesParams
) {
  return useQuery({
    queryKey: [
      ...JOURNAL_LINES_QUERY_KEY,
      journalEntryId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IJournalLineService>("journalLineService");
      return service.getAll(journalEntryId!, params);
    },
    enabled: !!journalEntryId,
  });
}

export function useJournalLine(journalEntryId: string | null, lineId: string | null) {
  return useQuery({
    queryKey: [...JOURNAL_LINES_QUERY_KEY, journalEntryId, lineId],
    queryFn: () => {
      const service = container.resolve<IJournalLineService>("journalLineService");
      return service.getById(journalEntryId!, lineId!);
    },
    enabled: !!journalEntryId && !!lineId,
  });
}

export function useCreateJournalLine(journalEntryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JournalLineWriteDto) => {
      const service = container.resolve<IJournalLineService>("journalLineService");
      return service.create(journalEntryId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_LINES_QUERY_KEY });
    },
  });
}

export function useUpdateJournalLine(journalEntryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalLineWriteDto }) => {
      const service = container.resolve<IJournalLineService>("journalLineService");
      return service.update(journalEntryId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_LINES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...JOURNAL_LINES_QUERY_KEY, journalEntryId, variables.id],
      });
    },
  });
}

export function useDeleteJournalLine(journalEntryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IJournalLineService>("journalLineService");
      return service.delete(journalEntryId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_LINES_QUERY_KEY });
    },
  });
}
