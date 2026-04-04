"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/presentation/providers/ToastProvider";
import { AppLoader } from "@/presentation/components/loader";
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
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useUsers } from "@/presentation/hooks/useUsers";
import {
  useCustomerInteraction,
  useUpdateCustomerInteraction,
} from "@/presentation/hooks/useCustomerInteractions";
import {
  INTERACTION_CHANNELS,
  INTERACTION_TYPES,
} from "./customer-interaction-constants";

const USERS_PAGE_SIZE = 300;
const REDIRECT_DELAY_MS = 1500;

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

export interface EditCustomerInteractionFormProps {
  customerId: string;
  interactionId: string;
  listHref?: string;
}

export function EditCustomerInteractionForm({
  customerId,
  interactionId,
  listHref: listHrefProp,
}: EditCustomerInteractionFormProps) {
  const router = useRouter();
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: row, isLoading, error } = useCustomerInteraction(
    customerId,
    interactionId
  );
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();
  const { data: users = [], isLoading: isUsersLoading } = useUsers({
    page: 1,
    limit: USERS_PAGE_SIZE,
  });
  const updateInteraction = useUpdateCustomerInteraction();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const listHref =
    listHrefProp ?? `/customers/${customerId}/interactions`;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      agentId: "",
      interactionChannel: "EMAIL",
      interactionType: "INQUIRY",
      summary: "",
      detailedNotes: "",
      externalReferenceId: "",
    },
  });

  useEffect(() => {
    if (row) {
      form.reset({
        tenantId: row.tenantId,
        agentId: row.agentId,
        interactionChannel: row.interactionChannel,
        interactionType: row.interactionType,
        summary: row.summary,
        detailedNotes: row.detailedNotes ?? "",
        externalReferenceId: row.externalReferenceId ?? "",
      });
    }
  }, [row, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    updateInteraction.mutate(
      {
        customerId,
        interactionId,
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
          toast.success("Interaction updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push(listHref), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update interaction."),
      }
    );
  };

  const textAreaClass = cn(
    "flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tracking-[0.02em] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
  );

  if (isLoading)
    return <AppLoader fullScreen={false} size="sm" message="Loading..." />;

  if (error || !row)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Interaction not found.</p>
        <Link href={listHref}>
          <Button variant="outline">Back to interactions</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={listHref}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">
          Edit interaction
        </h1>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-2xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isTenantsLoading || Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue placeholder="Select tenant" />
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
        </div>

        <div className="grid gap-2">
          <Label htmlFor="agentId">Agent</Label>
          <Controller
            control={form.control}
            name="agentId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isUsersLoading}
              >
                <SelectTrigger id="agentId">
                  <SelectValue placeholder="Select agent" />
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="interactionChannel">Channel</Label>
            <Controller
              control={form.control}
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
              control={form.control}
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
          <Input id="summary" {...form.register("summary")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="detailedNotes">Detailed notes</Label>
          <textarea
            id="detailedNotes"
            className={textAreaClass}
            {...form.register("detailedNotes")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="externalReferenceId">External reference</Label>
          <Input id="externalReferenceId" {...form.register("externalReferenceId")} />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Interaction updated. Redirecting...
          </p>
        )}
        {updateInteraction.isError && (
          <p className="text-sm text-red-600">Failed to update interaction.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateInteraction.isPending}>
            {updateInteraction.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={listHref}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
