"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { usePromotionRule, useUpdatePromotionRule } from "@/presentation/hooks/usePromotionRules";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { PromotionForm } from "./PromotionForm";

const FORM_ID = "edit-promotion-form";

export function EditPromotionRuleForm({ ruleId }: { ruleId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: rule, isLoading, error } = usePromotionRule(ruleId);
  const update = useUpdatePromotionRule();

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !rule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{apiErrorMessage(error, "Promotion not found.")}</p>
        <Link href="/promotion-rules">
          <Button variant="outline">Back to promotions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/promotion-rules">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit {rule.name}</h1>
      </div>
      <p className="text-sm text-muted">Changes apply to the next sale. Bills already made keep their discount.</p>
      <PromotionForm
        key={String(rule.id)}
        formId={FORM_ID}
        rule={rule}
        onSubmit={(data) =>
          update.mutate(
            { id: String(rule.id), data },
            {
              onSuccess: () => {
                toast.success("Promotion saved.");
                router.push("/promotion-rules");
              },
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save the promotion.")),
            },
          )
        }
      />
      <div className="flex gap-2">
        <Button type="submit" form={FORM_ID} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Link href="/promotion-rules">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
