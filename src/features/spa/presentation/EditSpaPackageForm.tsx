"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useSpaPackage, useUpdateSpaPackage } from "@/presentation/hooks/useSpa";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { SpaPackageForm } from "./SpaPackageForm";

const FORM_ID = "edit-spa-package-form";

export function EditSpaPackageForm({ packageId }: { packageId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: pkg, isLoading, error } = useSpaPackage(packageId);
  const update = useUpdateSpaPackage();

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !pkg) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{apiErrorMessage(error, "Package not found.")}</p>
        <Link href="/products?tab=spa">
          <Button variant="outline">Back to SPA packages</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products?tab=spa">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit {pkg.name}</h1>
      </div>
      <p className="text-sm text-muted">Changes apply to the next sale. Bills already made keep their price.</p>
      <SpaPackageForm
        key={pkg.id}
        formId={FORM_ID}
        pkg={pkg}
        onSubmit={(data) =>
          update.mutate(
            { id: pkg.id, data },
            {
              onSuccess: () => {
                toast.success("Package saved.");
                router.push("/products?tab=spa");
              },
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save the package.")),
            },
          )
        }
      />
      <div className="flex gap-2">
        <Button type="submit" form={FORM_ID} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Link href="/products?tab=spa">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
