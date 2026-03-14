"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IUserService } from "@/core/domain/services/IUserService";
import type { UserDto, UserUpdateDto } from "@/core/application/dtos/UserDto";
import type { GetUsersParams } from "@/core/domain/repositories/IUserRepository";

const USERS_QUERY_KEY = ["users"];

export function useUsers(params?: GetUsersParams) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const userService = container.resolve<IUserService>("userService");
      return userService.getAll(params);
    },
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => {
      const userService = container.resolve<IUserService>("userService");
      return userService.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<UserDto, "id">) => {
      const userService = container.resolve<IUserService>("userService");
      return userService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateDto }) => {
      const userService = container.resolve<IUserService>("userService");
      return userService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const userService = container.resolve<IUserService>("userService");
      return userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
