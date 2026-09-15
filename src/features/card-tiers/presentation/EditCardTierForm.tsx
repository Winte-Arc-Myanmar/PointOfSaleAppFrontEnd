"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCardTier, useUpdateCardTier } from "@/presentation/hooks/useCardTiers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { toCardTierWriteDto } from "@/core/application/mappers/CardTierMapper";
import { getHttpErrorMessage } from "@/lib/http-error";
import {
  CardTierFormFields,
  type CardTierFormValues,
} from "./CardTierFormFields";

const REDIRECT_DELAY_MS = 1500;
const LIST_HREF = "/card-tiers";

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

export function EditCardTierForm({ cardTierId }: { cardTierId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateCardTier();
  const { data: tier, isLoading, error } = useCardTier(cardTierId);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<CardTierFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      rank: 1,
      preloadAmount: 0,
      preloadFunding: "PURCHASED",
      discountBps: 0,
      isPostpaid: false,
      validityDays: 30,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!tier) return;
    form.reset({
      name: tier.name,
      rank: tier.rank,
      preloadAmount: tier.preloadAmount,
      preloadFunding: tier.preloadFunding,
      discountBps: tier.discountBps,
      isPostpaid: tier.isPostpaid,
      validityDays: tier.validityDays,
      isActive: tier.isActive,
    });
  }, [tier, form]);

  const onSubmit = (data: CardTierFormValues) => {
    setShowSuccess(false);
    update.mutate(
      { id: cardTierId, data: toCardTierWriteDto(data) },
      {
        onSuccess: () => {
          toast.success("Card tier updated. New cards use these terms; existing cards are unchanged.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`${LIST_HREF}/${cardTierId}`),
            REDIRECT_DELAY_MS,
          );
        },
        onError: (err: unknown) => {
          toast.error(getHttpErrorMessage(err, "Failed to update card tier."));
        },
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !tier) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Card tier not found.</p>
        <Link href={LIST_HREF}>
          <Button variant="outline">Back to Card Tiers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${LIST_HREF}/${cardTierId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit card tier</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <p className="text-sm text-muted">
          Affects cards issued from now on. Balances and terms on existing cards stay as sold.
        </p>
        <CardTierFormFields form={form} />

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Card tier updated. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`${LIST_HREF}/${cardTierId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
