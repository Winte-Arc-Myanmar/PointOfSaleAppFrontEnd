"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDepreciationSchedule } from "@/presentation/hooks/useDepreciationSchedules";
import { useJournalEntries } from "@/presentation/hooks/useJournalEntries";
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
const NONE_JOURNAL_ENTRY = "__none__";

const schema = z.object({
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  depreciationAmount: z.string().min(1, "Depreciation amount is required"),
  isPosted: z.boolean(),
  postedJournalEntryId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  scheduledDate: "",
  depreciationAmount: "0.00",
  isPosted: false,
  postedJournalEntryId: "",
};

export interface CreateDepreciationScheduleFormProps {
  fixedAssetId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateDepreciationScheduleForm({
  fixedAssetId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateDepreciationScheduleFormProps) {
  const create = useCreateDepreciationSchedule(fixedAssetId);
  const toast = useToast();
  const { data: entriesData } = useJournalEntries({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const journalEntries = getPaginatedItems(entriesData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const isPosted = useWatch({ control: form.control, name: "isPosted" });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (!isPosted) form.setValue("postedJournalEntryId", "");
  }, [isPosted, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        scheduledDate: data.scheduledDate,
        depreciationAmount: data.depreciationAmount.trim(),
        isPosted: data.isPosted,
        postedJournalEntryId:
          data.isPosted && data.postedJournalEntryId
            ? data.postedJournalEntryId
            : null,
      },
      {
        onSuccess: () => {
          toast.success("Depreciation schedule created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create depreciation schedule."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="scheduledDate">Scheduled date</Label>
          <Input id="scheduledDate" type="date" {...form.register("scheduledDate")} />
          {form.formState.errors.scheduledDate && (
            <p className="text-sm text-red-600">{form.formState.errors.scheduledDate.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="depreciationAmount">Depreciation amount</Label>
          <Input
            id="depreciationAmount"
            {...form.register("depreciationAmount")}
            placeholder="21.67"
          />
          {form.formState.errors.depreciationAmount && (
            <p className="text-sm text-red-600">
              {form.formState.errors.depreciationAmount.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPosted"
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isPosted")}
        />
        <Label htmlFor="isPosted" className="font-normal">
          Posted to journal
        </Label>
      </div>

      {isPosted && (
        <div className="grid gap-2">
          <Label htmlFor="postedJournalEntryId">Posted journal entry</Label>
          <Controller
            control={form.control}
            name="postedJournalEntryId"
            render={({ field }) => (
              <Select
                value={field.value || NONE_JOURNAL_ENTRY}
                onValueChange={(v) =>
                  field.onChange(v === NONE_JOURNAL_ENTRY ? "" : v)
                }
              >
                <SelectTrigger id="postedJournalEntryId">
                  <SelectValue placeholder="Select journal entry (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_JOURNAL_ENTRY}>None</SelectItem>
                  {journalEntries.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.description || e.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}
    </form>
  );
}
