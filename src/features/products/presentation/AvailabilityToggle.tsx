"use client";

import { useSetProductAvailability } from "@/presentation/hooks/useProducts";
import { useToast } from "@/presentation/providers/ToastProvider";
import { cn } from "@/lib/utils";

export function AvailabilityToggle({
  productId,
  productName,
  isAvailable,
}: {
  productId: string;
  productName: string;
  isAvailable: boolean;
}) {
  const setAvailability = useSetProductAvailability();
  const toast = useToast();

  const toggle = () =>
    setAvailability.mutate(
      { id: productId, isAvailable: !isAvailable },
      {
        onSuccess: () =>
          toast.success(
            `${productName} is now ${isAvailable ? "unavailable" : "available"}.`
          ),
        onError: () => toast.error(`Failed to update ${productName}.`),
      }
    );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAvailable}
      aria-label={`${productName}: ${isAvailable ? "available" : "unavailable"}`}
      disabled={setAvailability.isPending}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
      className="inline-flex items-center gap-2 text-xs font-medium disabled:opacity-60"
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          isAvailable ? "bg-emerald-500" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
            isAvailable ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </span>
      <span className={isAvailable ? "text-emerald-700" : "text-muted"}>
        {isAvailable ? "Available" : "Unavailable"}
      </span>
    </button>
  );
}
