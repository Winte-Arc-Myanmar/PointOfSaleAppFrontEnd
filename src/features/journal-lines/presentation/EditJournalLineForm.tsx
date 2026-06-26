"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useJournalLine,
  useUpdateJournalLine,
} from "@/presentation/hooks/useJournalLines";
import { useJournalEntry } from "@/presentation/hooks/useJournalEntries";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
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
  accountId: z.string().min(1, "Account is required"),
  transactionCurrency: z.string().min(3, "Currency is required").max(3),
  transactionDebit: z.string().min(1, "Transaction debit is required"),
  transactionCredit: z.string().min(1, "Transaction credit is required"),
  exchangeRate: z.string().min(1, "Exchange rate is required"),
  baseDebit: z.string().min(1, "Base debit is required"),
  baseCredit: z.string().min(1, "Base credit is required"),
});

type FormData = z.infer<typeof schema>;

export function EditJournalLineForm({
  journalEntryId,
  lineId,
}: {
  journalEntryId: string;
  lineId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateJournalLine(journalEntryId);
  const { data: entry } = useJournalEntry(journalEntryId);
  const { data: line, isLoading, error } = useJournalLine(journalEntryId, lineId);
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const accounts = getPaginatedItems(accountsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) => (entry?.tenantId ? a.tenantId === entry.tenantId : true)),
    [accounts, entry?.tenantId]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountId: "",
      transactionCurrency: "USD",
      transactionDebit: "0.0000",
      transactionCredit: "0.0000",
      exchangeRate: "1.0000",
      baseDebit: "0.0000",
      baseCredit: "0.0000",
    },
  });

  useEffect(() => {
    if (line) {
      form.reset({
        accountId: line.accountId,
        transactionCurrency: line.transactionCurrency,
        transactionDebit: line.transactionDebit,
        transactionCredit: line.transactionCredit,
        exchangeRate: line.exchangeRate,
        baseDebit: line.baseDebit,
        baseCredit: line.baseCredit,
      });
    }
  }, [line, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: lineId,
        data: {
          accountId: data.accountId,
          transactionCurrency: data.transactionCurrency.trim().toUpperCase(),
          transactionDebit: data.transactionDebit.trim(),
          transactionCredit: data.transactionCredit.trim(),
          exchangeRate: data.exchangeRate.trim(),
          baseDebit: data.baseDebit.trim(),
          baseCredit: data.baseCredit.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Journal line updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/journal-lines/${journalEntryId}/${lineId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update journal line."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Journal line not found.</p>
        <Link href={`/journal-lines/${journalEntryId}`}>
          <Button variant="outline">Back to Journal Lines</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/journal-lines/${journalEntryId}/${lineId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit journal line</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="accountId">GL account</Label>
          <Controller
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="accountId">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.accountCode} - {a.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transactionCurrency">Currency</Label>
            <Input
              id="transactionCurrency"
              {...form.register("transactionCurrency")}
              maxLength={3}
              className="uppercase"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transactionDebit">Transaction debit</Label>
            <Input id="transactionDebit" {...form.register("transactionDebit")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transactionCredit">Transaction credit</Label>
            <Input id="transactionCredit" {...form.register("transactionCredit")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="exchangeRate">Exchange rate</Label>
            <Input id="exchangeRate" {...form.register("exchangeRate")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baseDebit">Base debit</Label>
            <Input id="baseDebit" {...form.register("baseDebit")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baseCredit">Base credit</Label>
            <Input id="baseCredit" {...form.register("baseCredit")} />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Journal line updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/journal-lines/${journalEntryId}/${lineId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
