"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBankStatementLine } from "@/presentation/hooks/useBankStatementLines";
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

const LINE_STATUSES = ["UNMATCHED", "MATCHED"] as const;

const schema = z.object({
  transactionDate: z.string().min(1, "Transaction date is required"),
  description: z.string().min(1, "Description is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  amount: z.string().min(1, "Amount is required"),
  status: z.string().min(1, "Status is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  transactionDate: "",
  description: "",
  referenceNumber: "",
  amount: "0.0000",
  status: "UNMATCHED",
};

export interface CreateBankStatementLineFormProps {
  bankStatementId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateBankStatementLineForm({
  bankStatementId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateBankStatementLineFormProps) {
  const create = useCreateBankStatementLine(bankStatementId);
  const toast = useToast();

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
        transactionDate: data.transactionDate,
        description: data.description.trim(),
        referenceNumber: data.referenceNumber.trim(),
        amount: data.amount.trim(),
        status: data.status,
      },
      {
        onSuccess: () => {
          toast.success("Bank statement line created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create bank statement line."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="transactionDate">Transaction date</Label>
          <Input id="transactionDate" type="date" {...form.register("transactionDate")} />
          {form.formState.errors.transactionDate && (
            <p className="text-sm text-red-600">{form.formState.errors.transactionDate.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LINE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...form.register("description")}
          placeholder="Wire transfer from client"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="referenceNumber">Reference number</Label>
          <Input id="referenceNumber" {...form.register("referenceNumber")} placeholder="REF-001" />
          {form.formState.errors.referenceNumber && (
            <p className="text-sm text-red-600">{form.formState.errors.referenceNumber.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" {...form.register("amount")} placeholder="500.0000" />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
