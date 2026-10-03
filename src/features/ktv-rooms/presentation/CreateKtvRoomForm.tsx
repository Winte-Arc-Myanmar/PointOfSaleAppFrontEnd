"use client";

import { useEffect } from "react";
import { useCreateKtvRoom } from "@/presentation/hooks/useKtvRooms";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { KtvRoomForm } from "./KtvRoomForm";

export function CreateKtvRoomForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreateKtvRoom();
  const toast = useToast();

  useEffect(() => {
    onLoadingChange?.(create.isPending);
  }, [create.isPending, onLoadingChange]);

  return (
    <KtvRoomForm
      formId={formId}
      onSubmit={(data) =>
        create.mutate(data, {
          onSuccess: () => {
            toast.success(`Room ${data.roomNumber} added.`);
            onSuccess?.();
          },
          onError: (error) => toast.error(apiErrorMessage(error, "Couldn't add the room.")),
        })
      }
    />
  );
}
