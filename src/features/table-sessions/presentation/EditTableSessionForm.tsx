"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useUsers } from "@/presentation/hooks/useUsers";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useTableSession, useUpdateTableSession } from "@/presentation/hooks/useTableSessions";

const REDIRECT_DELAY_MS = 1500;

const schema = z.object({
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  waiterId: z.string().min(1, "Waiter is required"),
});

type FormData = z.infer<typeof schema>;

function getUserLabel(user: any): string {
  return user.fullName || user.username || user.email || String(user.id);
}

export function EditTableSessionForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateTableSession();
  const { data: session, isLoading, error } = useTableSession(sessionId);
  const { data: usersData } = useUsers({ page: 1, limit: 200 });
  const users = getPaginatedItems(usersData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      guestCount: 1,
      waiterId: "",
    },
  });

  useEffect(() => {
    if (session) {
      form.reset({
        guestCount: session.guestCount,
        waiterId: session.waiterId,
      });
    }
  }, [session, form]);

  const waiterOptions = useMemo(() => users, [users]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: sessionId,
        data: {
          guestCount: data.guestCount,
          waiterId: data.waiterId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Table session updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/table-sessions/${sessionId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update table session."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Table session not found.</p>
        <Link href="/table-sessions">
          <Button variant="outline">Back to Table Sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/table-sessions/${sessionId}`}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Edit table session</h1>
          <p className="text-sm text-muted">
            Session state: <span className="font-medium">{session.sessionState}</span>
          </p>
        </div>
      </div>

      {showSuccess && (
        <p className="text-sm text-emerald-600">Saved. Redirecting to session details...</p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Table ID</Label>
            <Input value={session.tableId} disabled className="font-mono text-xs" />
          </div>
          <div className="grid gap-2">
            <Label>Session ID</Label>
            <Input value={String(session.id)} disabled className="font-mono text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="guestCount">Guest count</Label>
            <Input
              id="guestCount"
              type="number"
              min={1}
              {...form.register("guestCount", { valueAsNumber: true })}
            />
            {form.formState.errors.guestCount && (
              <p className="text-sm text-red-600">{form.formState.errors.guestCount.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="waiterId">Waiter</Label>
            <Controller
              control={form.control}
              name="waiterId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="waiterId">
                    <SelectValue placeholder="Select waiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {waiterOptions.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {getUserLabel(user)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.waiterId && (
              <p className="text-sm text-red-600">{form.formState.errors.waiterId.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/table-sessions/${sessionId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
