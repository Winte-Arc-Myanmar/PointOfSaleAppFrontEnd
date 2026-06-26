"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useReconciliationMatch,
  useUpdateReconciliationMatch,
} from "@/presentation/hooks/useReconciliationMatches";
import { useUsers } from "@/presentation/hooks/useUsers";
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

const schema = z.object({
  statementLineId: z.string().min(1, "Statement line ID is required"),
  journalLineId: z.string().min(1, "Journal line ID is required"),
  matchedBy: z.string().min(1, "Matched by is required"),
});

type FormData = z.infer<typeof schema>;

export function EditReconciliationMatchForm({
  reconciliationMatchId,
}: {
  reconciliationMatchId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateReconciliationMatch();
  const { data: match, isLoading, error } = useReconciliationMatch(reconciliationMatchId);
  const { data: usersData } = useUsers({ page: 1, limit: LIST_LIMIT });
  const users = getPaginatedItems(usersData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      statementLineId: "",
      journalLineId: "",
      matchedBy: "",
    },
  });

  useEffect(() => {
    if (match) {
      form.reset({
        statementLineId: match.statementLineId,
        journalLineId: match.journalLineId,
        matchedBy: match.matchedBy,
      });
    }
  }, [match, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: reconciliationMatchId,
        data: {
          statementLineId: data.statementLineId.trim(),
          journalLineId: data.journalLineId.trim(),
          matchedBy: data.matchedBy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Reconciliation match updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/reconciliation-matches/${reconciliationMatchId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update reconciliation match."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !match) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Reconciliation match not found.</p>
        <Link href="/reconciliation-matches">
          <Button variant="outline">Back to Reconciliation Matches</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/reconciliation-matches/${reconciliationMatchId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit reconciliation match</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="statementLineId">Statement line ID</Label>
            <Input id="statementLineId" {...form.register("statementLineId")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="journalLineId">Journal line ID</Label>
            <Input id="journalLineId" {...form.register("journalLineId")} />
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
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Reconciliation match updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/reconciliation-matches/${reconciliationMatchId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
