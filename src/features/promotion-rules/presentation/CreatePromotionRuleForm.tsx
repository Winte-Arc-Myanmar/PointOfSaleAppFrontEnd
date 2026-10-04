"use client";

import { useEffect } from "react";
import { useCreatePromotionRule } from "@/presentation/hooks/usePromotionRules";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { PromotionForm } from "./PromotionForm";

export function CreatePromotionRuleForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreatePromotionRule();
  const toast = useToast();
  useEffect(() => onLoadingChange?.(create.isPending), [create.isPending, onLoadingChange]);

  return (
    <PromotionForm
      formId={formId}
      onSubmit={(data) =>
        create.mutate(data, {
          onSuccess: () => {
            toast.success(`${data.name} added.`);
            onSuccess?.();
          },
          onError: (error) => toast.error(apiErrorMessage(error, "Couldn't add the promotion.")),
        })
      }
    />
  );
}
