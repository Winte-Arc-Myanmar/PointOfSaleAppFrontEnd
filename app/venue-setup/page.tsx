import { Shell } from "@/presentation/components/layout/Shell";
import { VenueSetupForm } from "@/features/venue-settings/presentation/VenueSetupForm";
import { ShopSettingsDescription } from "@/features/venue-settings/presentation/ShopSettingsDescription";

export default function VenueSetupPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <ShopSettingsDescription />
        <VenueSetupForm />
      </div>
    </Shell>
  );
}
