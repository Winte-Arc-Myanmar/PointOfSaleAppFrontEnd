import { Shell } from "@/presentation/components/layout/Shell";
import { OnboardTenantForm } from "@/features/system-admin/presentation/OnboardTenantForm";

export default function OnboardPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <OnboardTenantForm />
      </div>
    </Shell>
  );
}
