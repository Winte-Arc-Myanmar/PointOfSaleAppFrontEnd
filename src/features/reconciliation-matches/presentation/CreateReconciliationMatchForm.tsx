"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateReconciliationMatch } from "@/presentation/hooks/useReconciliationMatches";
import { useUsers } from "@/presentation/hooks/useUsers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const LIST_LIMIT = 200;

const schema = z.object({
  statementLineId: z.string().min(1, "Statement line ID is required"),
  journalLineId: z.string().min(1, "Journal line ID is required"),
  matchedBy: z.string().min(1, "Matched by is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  statementLineId: "",
  journalLineId: "",
  matchedBy: "",
};

export interface CreateReconciliationMatchFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateReconciliationMatchForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateReconciliationMatchFormProps) {
  const create = useCreateReconciliationMatch();
  const toast = useToast();
  const { data: usersData } = useUsers({ page: 1, limit: LIST_LIMIT });
  const users = getPaginatedItems(usersData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        statementLineId: data.statementLineId.trim(),
        journalLineId: data.journalLineId.trim(),
        matchedBy: data.matchedBy,
      },
      {
        onSuccess: () => {
          toast.success("Reconciliation match created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create reconciliation match."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="statementLineId">Statement line ID</Label>
          <Input id="statementLineId" {...form.register("statementLineId")} placeholder="uuid" />
          {form.formState.errors.statementLineId && (
            <p className="text-sm text-red-600">{form.formState.errors.statementLineId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="journalLineId">Journal line ID</Label>
          <Input id="journalLineId" {...form.register("journalLineId")} placeholder="uuid" />
          {form.formState.errors.journalLineId && (
            <p className="text-sm text-red-600">{form.formState.errors.journalLineId.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="matchedBy">Matched by</Label>
        <Controller
          control={form.control}
          name="matchedBy"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="matchedBy">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.fullName || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.matchedBy && (
          <p className="text-sm text-red-600">{form.formState.errors.matchedBy.message}</p>
        )}
      </div>
    </form>
  );
}
