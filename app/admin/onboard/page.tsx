import { Shell } from "@/presentation/components/layout/Shell";
import { OnboardTenantForm } from "@/features/system-admin/presentation/OnboardTenantForm";

export default function OnboardPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Onboard a new tenant with an initial branch and owner account in one step.
        </p>
        <OnboardTenantForm />
      </div>
    </Shell>
  );
}
