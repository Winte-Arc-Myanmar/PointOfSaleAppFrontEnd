import { Shell } from "@/presentation/components/layout/Shell";
import { VenueSetupForm } from "@/features/venue-settings/presentation/VenueSetupForm";

export default function VenueSetupPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          How your business runs its rooms. Changes apply straight away to the POS and room tablets.
        </p>
        <VenueSetupForm />
      </div>
    </Shell>
  );
}
