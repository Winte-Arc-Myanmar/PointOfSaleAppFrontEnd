"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCardTier } from "@/presentation/hooks/useCardTiers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { toCardTierWriteDto } from "@/core/application/mappers/CardTierMapper";
import { getHttpErrorMessage } from "@/lib/http-error";
import {
  CardTierFormFields,
  type CardTierFormValues,
} from "./CardTierFormFields";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  rank: z.number().int("Rank must be a whole number").min(1, "Rank must be at least 1"),
  preloadAmount: z.number().min(0, "Preload amount must be zero or greater"),
  preloadFunding: z.string().min(1, "Preload funding is required"),
  discountBps: z.number().int("Discount bps must be a whole number").min(0),
  isPostpaid: z.boolean(),
  validityDays: z.number().int("Validity days must be a whole number").min(1, "Validity days must be at least 1"),
  isActive: z.boolean(),
});

const defaultValues: CardTierFormValues = {
  name: "",
  rank: 1,
  preloadAmount: 0,
  preloadFunding: "PURCHASED",
  discountBps: 0,
  isPostpaid: false,
  validityDays: 30,
  isActive: true,
};

export function CreateCardTierForm({
  onSuccess,
  formId,
  onLoadingChange,
}: {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreateCardTier();
  const toast = useToast();
  const form = useForm<CardTierFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending);
  }, [create.isPending, onLoadingChange]);

  const onSubmit = (data: CardTierFormValues) => {
    create.mutate(toCardTierWriteDto(data), {
      onSuccess: () => {
        toast.success("Card tier created.");
        form.reset(defaultValues);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        toast.error(getHttpErrorMessage(error, "Failed to create card tier."));
      },
    });
  };

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit, () => {
        toast.error("Please fix the highlighted fields before saving.");
      })}
      className="space-y-4"
    >
      <p className="text-sm text-muted">
        Tiers can be changed at any time. Editing later never affects cards already issued.
      </p>
      <CardTierFormFields form={form} />
    </form>
  );
}
