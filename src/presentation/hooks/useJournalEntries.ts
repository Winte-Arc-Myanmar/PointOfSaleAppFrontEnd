"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IJournalEntryService } from "@/core/domain/services/IJournalEntryService";
import type { JournalEntryWriteDto } from "@/core/domain/repositories/IJournalEntryRepository";
import type { GetJournalEntriesParams } from "@/core/domain/repositories/IJournalEntryRepository";

const JOURNAL_ENTRIES_QUERY_KEY = ["journal-entries"];

export function useJournalEntries(params?: GetJournalEntriesParams) {
  return useQuery({
    queryKey: [
      ...JOURNAL_ENTRIES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IJournalEntryService>("journalEntryService");
      return service.getAll(params);
    },
  });
}

export function useJournalEntry(id: string | null) {
  return useQuery({
    queryKey: [...JOURNAL_ENTRIES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IJournalEntryService>("journalEntryService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JournalEntryWriteDto) => {
      const service = container.resolve<IJournalEntryService>("journalEntryService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalEntryWriteDto }) => {
      const service = container.resolve<IJournalEntryService>("journalEntryService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...JOURNAL_ENTRIES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IJournalEntryService>("journalEntryService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_ENTRIES_QUERY_KEY });
    },
  });
}
