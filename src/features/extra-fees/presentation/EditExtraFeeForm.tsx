"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useExtraFees, useUpdateExtraFee } from "@/presentation/hooks/useExtraFees";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { ExtraFeeForm } from "./ExtraFeeForm";

const FORM_ID = "edit-extra-fee-form";

export function EditExtraFeeForm({ feeId }: { feeId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: fees, isLoading, error } = useExtraFees();
  const update = useUpdateExtraFee();
  const fee = fees?.find((f) => f.id === feeId);

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !fee || fee.isOther) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{apiErrorMessage(error, "Fee not found.")}</p>
        <Link href="/extra-fees">
          <Button variant="outline">Back to extra fees</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/extra-fees">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit {fee.name}</h1>
      </div>
      <ExtraFeeForm
        key={fee.id}
        formId={FORM_ID}
        fee={fee}
        onSubmit={(data) =>
          update.mutate(
            { id: fee.id, data },
            {
              onSuccess: () => {
                toast.success("Saved.");
                router.push("/extra-fees");
              },
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save the fee.")),
            },
          )
        }
      />
      <div className="flex gap-2">
        <Button type="submit" form={FORM_ID} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Link href="/extra-fees">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
