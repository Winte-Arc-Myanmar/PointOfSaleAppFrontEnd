"use client";

import { useEffect } from "react";
import { useCreateHostess } from "@/presentation/hooks/useHostesses";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { HostessForm } from "./HostessForm";

export function CreateHostessForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreateHostess();
  const toast = useToast();

  useEffect(() => {
    onLoadingChange?.(create.isPending);
  }, [create.isPending, onLoadingChange]);

  return (
    <HostessForm
      formId={formId}
      onSubmit={(data) =>
        create.mutate(data, {
          onSuccess: () => {
            toast.success(`${data.name} added.`);
            onSuccess?.();
          },
          onError: (error) => toast.error(apiErrorMessage(error, "Couldn't add the hostess.")),
        })
      }
    />
  );
}
