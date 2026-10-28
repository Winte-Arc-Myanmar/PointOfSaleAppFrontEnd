"use client";

import { useEffect } from "react";
import { useCreateExtraFee } from "@/presentation/hooks/useExtraFees";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { ExtraFeeForm } from "./ExtraFeeForm";

export function CreateExtraFeeForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreateExtraFee();
  const toast = useToast();

  useEffect(() => {
    onLoadingChange?.(create.isPending);
  }, [create.isPending, onLoadingChange]);

  return (
    <ExtraFeeForm
      formId={formId}
      onSubmit={(data) =>
        create.mutate(data, {
          onSuccess: () => {
            toast.success(`${data.name} added.`);
            onSuccess?.();
          },
          onError: (error) => toast.error(apiErrorMessage(error, "Couldn't add the fee.")),
        })
      }
    />
  );
}
