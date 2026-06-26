"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDepreciationSchedule,
  useUpdateDepreciationSchedule,
} from "@/presentation/hooks/useDepreciationSchedules";
import { useJournalEntries } from "@/presentation/hooks/useJournalEntries";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;
const NONE_JOURNAL_ENTRY = "__none__";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const schema = z.object({
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  depreciationAmount: z.string().min(1, "Depreciation amount is required"),
  isPosted: z.boolean(),
  postedJournalEntryId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EditDepreciationScheduleForm({
  fixedAssetId,
  scheduleId,
}: {
  fixedAssetId: string;
  scheduleId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateDepreciationSchedule(fixedAssetId);
  const { data: schedule, isLoading, error } = useDepreciationSchedule(
    fixedAssetId,
    scheduleId
  );
  const { data: entriesData } = useJournalEntries({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const journalEntries = getPaginatedItems(entriesData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduledDate: "",
      depreciationAmount: "0.00",
      isPosted: false,
      postedJournalEntryId: "",
    },
  });

  const isPosted = useWatch({ control: form.control, name: "isPosted" });

  useEffect(() => {
    if (schedule) {
      form.reset({
        scheduledDate: toDateInputValue(schedule.scheduledDate),
        depreciationAmount: schedule.depreciationAmount,
        isPosted: schedule.isPosted,
        postedJournalEntryId: schedule.postedJournalEntryId ?? "",
      });
    }
  }, [schedule, form]);

  useEffect(() => {
    if (!isPosted) form.setValue("postedJournalEntryId", "");
  }, [isPosted, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: scheduleId,
        data: {
          scheduledDate: data.scheduledDate,
          depreciationAmount: data.depreciationAmount.trim(),
          isPosted: data.isPosted,
          postedJournalEntryId:
            data.isPosted && data.postedJournalEntryId
              ? data.postedJournalEntryId
              : null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Depreciation schedule updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/depreciation-schedules/${fixedAssetId}/${scheduleId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update depreciation schedule."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !schedule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Depreciation schedule not found.</p>
        <Link href={`/depreciation-schedules/${fixedAssetId}`}>
          <Button variant="outline">Back to Depreciation Schedules</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/depreciation-schedules/${fixedAssetId}/${scheduleId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit depreciation schedule</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="scheduledDate">Scheduled date</Label>
            <Input id="scheduledDate" type="date" {...form.register("scheduledDate")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="depreciationAmount">Depreciation amount</Label>
            <Input id="depreciationAmount" {...form.register("depreciationAmount")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Depreciation schedule updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/depreciation-schedules/${fixedAssetId}/${scheduleId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
