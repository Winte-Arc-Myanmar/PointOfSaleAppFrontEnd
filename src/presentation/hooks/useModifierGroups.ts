"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  ModifierCreateDto,
  ModifierGroupAttachProductDto,
  ModifierGroupCreateDto,
  ModifierGroupUpdateDto,
  ModifierUpdateDto,
} from "@/core/application/dtos/ModifierGroupDto";
import type {
  GetModifierGroupsParams,
  GetModifiersParams,
} from "@/core/domain/repositories/IModifierGroupRepository";
import type { IModifierGroupService } from "@/core/domain/services/IModifierGroupService";

const MODIFIER_GROUPS_QUERY_KEY = ["modifier-groups"];
const MODIFIERS_QUERY_KEY = ["modifiers"];

export function useModifierGroups(params?: GetModifierGroupsParams) {
  return useQuery({
    queryKey: [
      ...MODIFIER_GROUPS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.getAll(params);
    },
  });
}

export function useModifierGroup(id: string | null) {
  return useQuery({
    queryKey: [...MODIFIER_GROUPS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ModifierGroupCreateDto) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_GROUPS_QUERY_KEY });
    },
  });
}

export function useUpdateModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModifierGroupUpdateDto }) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_GROUPS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...MODIFIER_GROUPS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteModifierGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_GROUPS_QUERY_KEY });
    },
  });
}

export function useAttachModifierGroupToProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModifierGroupAttachProductDto }) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.attachProduct(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MODIFIER_GROUPS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDetachModifierGroupFromProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productId }: { id: string; productId: string }) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.detachProduct(id, productId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MODIFIER_GROUPS_QUERY_KEY, variables.id] });
    },
  });
}

export function useModifiers(
  groupId: string | null,
  params?: GetModifiersParams,
) {
  return useQuery({
    queryKey: [
      ...MODIFIERS_QUERY_KEY,
      groupId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.listModifiers(groupId!, params);
    },
    enabled: !!groupId,
  });
}

export function useCreateModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: ModifierCreateDto }) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.createModifier(groupId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MODIFIER_GROUPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MODIFIERS_QUERY_KEY, variables.groupId] });
    },
  });
}

export function useUpdateModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      id,
      data,
    }: {
      groupId: string;
      id: string;
      data: ModifierUpdateDto;
    }) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.updateModifier(groupId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MODIFIERS_QUERY_KEY, variables.groupId] });
    },
  });
}

export function useDeleteModifier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, id }: { groupId: string; id: string }) => {
      const service = container.resolve<IModifierGroupService>("modifierGroupService");
      return service.deleteModifier(groupId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MODIFIERS_QUERY_KEY, variables.groupId] });
    },
  });
}
