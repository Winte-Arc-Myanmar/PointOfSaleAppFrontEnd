"use client";

import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { ALLOW_ALL_TENANTS, setActingTenantId } from "@/lib/acting-tenant";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useActingTenant } from "@/presentation/hooks/useActingTenant";
import { usePermissions } from "@/presentation/hooks/usePermissions";

const ALL = "__all__";

/** Which tenant a system admin is looking at and changing. */
export function TenantSwitcher({ className }: { className?: string }) {
  const { isSystemAdmin } = usePermissions();
  const actingTenantId = useActingTenant();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["acting-tenant-options"],
    queryFn: () =>
      container
        .resolve<ITenantService>("tenantService")
        .getAll({ page: 1, limit: 500 }),
    enabled: isSystemAdmin,
  });

  const tenants = getPaginatedItems(data);
  const known = tenants.some((tenant) => tenant.id === actingTenantId);

  useEffect(() => {
    if (!isSystemAdmin || ALLOW_ALL_TENANTS || !tenants.length || known) return;
    // Always one tenant: the last choice, or the first while none is made.
    setActingTenantId(tenants[0].id);
    void queryClient.invalidateQueries();
  }, [isSystemAdmin, known, queryClient, tenants]);

  if (!isSystemAdmin) return null;

  const choose = (value: string) => {
    setActingTenantId(value === ALL ? null : value);
    // Everything on screen belonged to the previous tenant.
    void queryClient.invalidateQueries();
  };

  return (
    <div className={className ?? "flex items-center gap-2"}>
      <Building2 className="h-4 w-4 shrink-0 text-muted" />
      <Select value={actingTenantId ?? (ALLOW_ALL_TENANTS ? ALL : undefined)} onValueChange={choose}>
        <SelectTrigger className="h-9 w-[200px]" aria-label="Tenant">
          <SelectValue placeholder={isLoading ? "Loading tenants..." : "Choose a tenant"} />
        </SelectTrigger>
        <SelectContent>
          {ALLOW_ALL_TENANTS ? <SelectItem value={ALL}>All tenants</SelectItem> : null}
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
