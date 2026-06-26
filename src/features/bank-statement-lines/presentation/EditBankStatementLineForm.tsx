"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useBankStatementLine,
  useUpdateBankStatementLine,
} from "@/presentation/hooks/useBankStatementLines";
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

const REDIRECT_DELAY_MS = 1500;
const LINE_STATUSES = ["UNMATCHED", "MATCHED"] as const;

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const schema = z.object({
  transactionDate: z.string().min(1, "Transaction date is required"),
  description: z.string().min(1, "Description is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  amount: z.string().min(1, "Amount is required"),
  status: z.string().min(1, "Status is required"),
});

type FormData = z.infer<typeof schema>;

export function EditBankStatementLineForm({
  bankStatementId,
  lineId,
}: {
  bankStatementId: string;
  lineId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateBankStatementLine(bankStatementId);
  const { data: line, isLoading, error } = useBankStatementLine(bankStatementId, lineId);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionDate: "",
      description: "",
      referenceNumber: "",
      amount: "0.0000",
      status: "UNMATCHED",
    },
  });

  useEffect(() => {
    if (line) {
      form.reset({
        transactionDate: toDateInputValue(line.transactionDate),
        description: line.description,
        referenceNumber: line.referenceNumber,
        amount: line.amount,
        status: line.status,
      });
    }
  }, [line, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: lineId,
        data: {
          transactionDate: data.transactionDate,
          description: data.description.trim(),
          referenceNumber: data.referenceNumber.trim(),
          amount: data.amount.trim(),
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          toast.success("Bank statement line updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/bank-statement-lines/${bankStatementId}/${lineId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update bank statement line."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !line) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Bank statement line not found.</p>
        <Link href={`/bank-statement-lines/${bankStatementId}`}>
          <Button variant="outline">Back to Bank Statement Lines</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/bank-statement-lines/${bankStatementId}/${lineId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit bank statement line</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transactionDate">Transaction date</Label>
            <Input id="transactionDate" type="date" {...form.register("transactionDate")} />
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
          <Input id="description" {...form.register("description")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="referenceNumber">Reference number</Label>
            <Input id="referenceNumber" {...form.register("referenceNumber")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" {...form.register("amount")} />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Bank statement line updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/bank-statement-lines/${bankStatementId}/${lineId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
