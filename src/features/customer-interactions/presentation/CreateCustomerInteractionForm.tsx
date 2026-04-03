"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useCreateCustomerInteraction } from "@/presentation/hooks/useCustomerInteractions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useUsers } from "@/presentation/hooks/useUsers";
import { usePermissions } from "@/presentation/hooks/usePermissions";
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
import {
  INTERACTION_CHANNELS,
  INTERACTION_TYPES,
} from "./customer-interaction-constants";

const USERS_PAGE_SIZE = 300;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  agentId: z.string().min(1, "Agent is required"),
  interactionChannel: z.string().min(1, "Channel is required"),
  interactionType: z.string().min(1, "Type is required"),
  summary: z.string().min(1, "Summary is required"),
  detailedNotes: z.string(),
  externalReferenceId: z.string(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  agentId: "",
  interactionChannel: "EMAIL",
  interactionType: "INQUIRY",
  summary: "",
  detailedNotes: "",
  externalReferenceId: "",
};

function defaultLockedTenant(lockedTenantId: string | undefined) {
  return { ...defaultValues, tenantId: lockedTenantId ?? "" };
}

export interface CreateCustomerInteractionFormProps {
  customerId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateCustomerInteractionForm({
  customerId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateCustomerInteractionFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const createInteraction = useCreateCustomerInteraction();
  const toast = useToast();
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();
  const { data: users = [], isLoading: isUsersLoading } = useUsers({
    page: 1,
    limit: USERS_PAGE_SIZE,
  });

  useEffect(() => {
    onLoadingChange?.(createInteraction.isPending ?? false);
  }, [createInteraction.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultLockedTenant(lockedTenantId),
  });

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  const onSubmit = (data: FormData) => {
    createInteraction.mutate(
      {
        customerId,
        data: {
          tenantId: data.tenantId,
          agentId: data.agentId,
          interactionChannel: data.interactionChannel,
          interactionType: data.interactionType,
          summary: data.summary,
          detailedNotes: data.detailedNotes || undefined,
          externalReferenceId: data.externalReferenceId.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Interaction created.");
          reset(defaultLockedTenant(lockedTenantId));
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create interaction."),
      }
    );
  };

  const textAreaClass = cn(
    "flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tracking-[0.02em] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
  );

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="tenantId">Tenant</Label>
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isTenantsLoading || Boolean(lockedTenantId)}
            >
              <SelectTrigger id="tenantId">
                <SelectValue
                  placeholder={
                    isTenantsLoading ? "Loading tenants..." : "Select tenant"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.tenantId && (
          <p className="text-sm text-red-600">{errors.tenantId.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agentId">Agent</Label>
        <Controller
          control={control}
          name="agentId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isUsersLoading}
            >
              <SelectTrigger id="agentId">
                <SelectValue
                  placeholder={
                    isUsersLoading ? "Loading users..." : "Select agent"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={String(u.id)} value={String(u.id)}>
                    {u.fullName || u.email || String(u.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.agentId && (
          <p className="text-sm text-red-600">{errors.agentId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="interactionChannel">Channel</Label>
          <Controller
            control={control}
            name="interactionChannel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="interactionChannel">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  {INTERACTION_CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interactionType">Type</Label>
          <Controller
            control={control}
            name="interactionType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="interactionType">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {INTERACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="summary">Summary</Label>
        <Input id="summary" {...register("summary")} placeholder="Short summary" />
        {errors.summary && (
          <p className="text-sm text-red-600">{errors.summary.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="detailedNotes">Detailed notes</Label>
        <textarea
          id="detailedNotes"
          className={textAreaClass}
          {...register("detailedNotes")}
          placeholder="Optional detailed notes..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="externalReferenceId">External reference (optional)</Label>
        <Input
          id="externalReferenceId"
          {...register("externalReferenceId")}
          placeholder="e.g. EXT-REF-001"
        />
      </div>

      {createInteraction.isError && (
        <p className="text-sm text-red-600">
          Failed to create interaction. Please try again.
        </p>
      )}

      {!formId && (
        <Button type="submit" disabled={createInteraction.isPending}>
          {createInteraction.isPending ? "Creating..." : "Create interaction"}
        </Button>
      )}
    </form>
  );
}
