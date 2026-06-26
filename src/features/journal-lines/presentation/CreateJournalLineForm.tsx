"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateJournalLine } from "@/presentation/hooks/useJournalLines";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
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
  accountId: z.string().min(1, "Account is required"),
  transactionCurrency: z.string().min(3, "Currency is required").max(3),
  transactionDebit: z.string().min(1, "Transaction debit is required"),
  transactionCredit: z.string().min(1, "Transaction credit is required"),
  exchangeRate: z.string().min(1, "Exchange rate is required"),
  baseDebit: z.string().min(1, "Base debit is required"),
  baseCredit: z.string().min(1, "Base credit is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  accountId: "",
  transactionCurrency: "USD",
  transactionDebit: "0.0000",
  transactionCredit: "0.0000",
  exchangeRate: "1.0000",
  baseDebit: "0.0000",
  baseCredit: "0.0000",
};

export interface CreateJournalLineFormProps {
  journalEntryId: string;
  tenantId?: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateJournalLineForm({
  journalEntryId,
  tenantId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateJournalLineFormProps) {
  const create = useCreateJournalLine(journalEntryId);
  const toast = useToast();
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const accounts = getPaginatedItems(accountsData);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) => (tenantId ? a.tenantId === tenantId : true)),
    [accounts, tenantId]
  );

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
        accountId: data.accountId,
        transactionCurrency: data.transactionCurrency.trim().toUpperCase(),
        transactionDebit: data.transactionDebit.trim(),
        transactionCredit: data.transactionCredit.trim(),
        exchangeRate: data.exchangeRate.trim(),
        baseDebit: data.baseDebit.trim(),
        baseCredit: data.baseCredit.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Journal line created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create journal line."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        {form.formState.errors.accountId && (
          <p className="text-sm text-red-600">{form.formState.errors.accountId.message}</p>
        )}
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
    </form>
  );
}
