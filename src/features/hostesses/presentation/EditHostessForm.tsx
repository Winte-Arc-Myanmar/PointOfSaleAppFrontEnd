"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useHostess, useUpdateHostess } from "@/presentation/hooks/useHostesses";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { HostessForm } from "./HostessForm";

const FORM_ID = "edit-hostess-form";

export function EditHostessForm({ hostessId }: { hostessId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: hostess, isLoading, error } = useHostess(hostessId);
  const update = useUpdateHostess();

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !hostess) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{apiErrorMessage(error, "Hostess not found.")}</p>
        <Link href="/hostesses">
          <Button variant="outline">Back to hostesses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hostesses">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit {hostess.name}</h1>
      </div>
      <HostessForm
        key={hostess.id}
        formId={FORM_ID}
        hostess={hostess}
        onSubmit={(data) =>
          update.mutate(
            { id: hostess.id, data },
            {
              onSuccess: () => {
                toast.success("Saved.");
                router.push("/hostesses");
              },
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save the hostess.")),
            },
          )
        }
      />
      <div className="flex gap-2">
        <Button type="submit" form={FORM_ID} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Link href="/hostesses">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
