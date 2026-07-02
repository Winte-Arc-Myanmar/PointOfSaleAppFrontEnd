"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ISectionService } from "@/core/domain/services/ISectionService";
import type {
  SectionAssignmentCreateDto,
  SectionAssignmentUpdateDto,
  SectionCreateDto,
  SectionUpdateDto,
} from "@/core/application/dtos/SectionDto";
import type { GetSectionsParams } from "@/core/domain/repositories/ISectionRepository";

const SECTIONS_QUERY_KEY = ["sections"];
const SECTION_ASSIGNMENTS_QUERY_KEY = ["section-assignments"];

export function useSections(params?: GetSectionsParams) {
  return useQuery({
    queryKey: [
      ...SECTIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.getAll(params);
    },
  });
}

export function useSection(id: string | null) {
  return useQuery({
    queryKey: [...SECTIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SectionCreateDto) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEY });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SectionUpdateDto }) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...SECTIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEY });
    },
  });
}

export function useAttachDiningTableToSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, tableId }: { sectionId: string; tableId: string }) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.attachTable(sectionId, tableId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...SECTIONS_QUERY_KEY, variables.sectionId] });
    },
  });
}

export function useDetachDiningTableFromSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, tableId }: { sectionId: string; tableId: string }) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.detachTable(sectionId, tableId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...SECTIONS_QUERY_KEY, variables.sectionId] });
    },
  });
}

export function useSectionAssignments(sectionId: string | null) {
  return useQuery({
    queryKey: [...SECTION_ASSIGNMENTS_QUERY_KEY, sectionId],
    queryFn: () => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.listAssignments(sectionId!);
    },
    enabled: !!sectionId,
  });
}

export function useCreateSectionAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: string;
      data: SectionAssignmentCreateDto;
    }) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.createAssignment(sectionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SECTION_ASSIGNMENTS_QUERY_KEY, variables.sectionId],
      });
    },
  });
}

export function useUpdateSectionAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      assignmentId,
      data,
    }: {
      sectionId: string;
      assignmentId: string;
      data: SectionAssignmentUpdateDto;
    }) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.updateAssignment(assignmentId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SECTION_ASSIGNMENTS_QUERY_KEY, variables.sectionId],
      });
    },
  });
}

export function useEndSectionAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, assignmentId }: { sectionId: string; assignmentId: string }) => {
      const service = container.resolve<ISectionService>("sectionService");
      return service.endAssignment(assignmentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...SECTION_ASSIGNMENTS_QUERY_KEY, variables.sectionId],
      });
    },
  });
}
