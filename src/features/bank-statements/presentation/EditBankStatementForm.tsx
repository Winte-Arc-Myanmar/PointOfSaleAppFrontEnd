"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useBankStatement,
  useUpdateBankStatement,
} from "@/presentation/hooks/useBankStatements";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
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

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  glAccountId: z.string().min(1, "GL account is required"),
  statementDate: z.string().min(1, "Statement date is required"),
  openingBalance: z.string().min(1, "Opening balance is required"),
  closingBalance: z.string().min(1, "Closing balance is required"),
});

type FormData = z.infer<typeof schema>;

export function EditBankStatementForm({ bankStatementId }: { bankStatementId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateBankStatement();
  const { data: statement, isLoading, error } = useBankStatement(bankStatementId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const accounts = getPaginatedItems(accountsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      glAccountId: "",
      statementDate: "",
      openingBalance: "0.0000",
      closingBalance: "0.0000",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) => (selectedTenantId ? a.tenantId === selectedTenantId : false)),
    [accounts, selectedTenantId]
  );

  useEffect(() => {
    if (statement) {
      form.reset({
        tenantId: statement.tenantId,
        glAccountId: statement.glAccountId,
        statementDate: toDateInputValue(statement.statementDate),
        openingBalance: statement.openingBalance,
        closingBalance: statement.closingBalance,
      });
    }
  }, [statement, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: bankStatementId,
        data: {
          tenantId: data.tenantId,
          glAccountId: data.glAccountId,
          statementDate: data.statementDate,
          openingBalance: data.openingBalance.trim(),
          closingBalance: data.closingBalance.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Bank statement updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/bank-statements/${bankStatementId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update bank statement."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !statement) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Bank statement not found.</p>
        <Link href="/bank-statements">
          <Button variant="outline">Back to Bank Statements</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/bank-statements/${bankStatementId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit bank statement</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Controller
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={Boolean(lockedTenantId)}
                >
                  <SelectTrigger id="tenantId">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="glAccountId">GL account</Label>
            <Controller
              control={form.control}
              name="glAccountId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="glAccountId">
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
        </div>

        <div className="grid gap-2">
          <Label htmlFor="statementDate">Statement date</Label>
          <Input id="statementDate" type="date" {...form.register("statementDate")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="openingBalance">Opening balance</Label>
            <Input id="openingBalance" {...form.register("openingBalance")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="closingBalance">Closing balance</Label>
            <Input id="closingBalance" {...form.register("closingBalance")} />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Bank statement updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/bank-statements/${bankStatementId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
