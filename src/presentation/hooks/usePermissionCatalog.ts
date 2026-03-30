"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPermissionService } from "@/core/domain/services/IPermissionService";

const PERMISSIONS_QUERY_KEY = ["permissions"];

function getService() {
  return container.resolve<IPermissionService>("permissionService");
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: () => getService().getAll(),
  });
}

