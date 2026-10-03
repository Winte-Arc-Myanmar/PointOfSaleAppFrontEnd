"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaymentMethod, useUpdatePaymentMethod } from "@/presentation/hooks/usePaymentMethods";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { apiErrorMessage } from "@/lib/api-error";
import {
  PaymentMethodFields,
  paymentMethodFieldsSchema,
  type PaymentMethodFieldValues,
} from "./PaymentMethodFields";

const REDIRECT_DELAY_MS = 1500;

export function EditPaymentMethodForm({ paymentMethodId }: { paymentMethodId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePaymentMethod();
  const { data: method, isLoading, error } = usePaymentMethod(paymentMethodId);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<PaymentMethodFieldValues>({
    resolver: zodResolver(paymentMethodFieldsSchema),
    defaultValues: { name: "", kind: "OTHER", glAccountId: "", isActive: true },
  });
  const kind = useWatch({ control: form.control, name: "kind" });

  useEffect(() => {
    if (method) {
      form.reset({
        name: method.name,
        kind: method.kind,
        glAccountId: method.glAccountId,
        isActive: method.isActive,
      });
    }
  }, [method, form]);

  const onSubmit = (data: PaymentMethodFieldValues) => {
    if (!method) return;
    setShowSuccess(false);
    update.mutate(
      {
        id: paymentMethodId,
        data: {
          tenantId: method.tenantId,
          name: data.name.trim(),
          kind: data.kind,
          isActive: data.isActive,
          glAccountId: data.glAccountId || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Payment method updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/payment-methods/${paymentMethodId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: (err) =>
          toast.error(apiErrorMessage(err, "Failed to update payment method.")),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !method) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Payment method not found.</p>
        <Link href="/payment-methods">
          <Button variant="outline">Back to payment methods</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/payment-methods/${paymentMethodId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit payment method</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <PaymentMethodFields
          control={form.control}
          register={form.register}
          errors={form.formState.errors}
          kind={kind}
        />

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Payment method updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/payment-methods/${paymentMethodId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
