import { Shell } from "@/presentation/components/layout/Shell";
import { HostessList } from "@/features/hostesses/presentation/HostessList";

export default function HostessesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Hostesses and dancers called to Private VIP Lounges. The till asks who served when it sells a service set to ask, and
          shows which room each one is in.
        </p>
        <HostessList />
      </div>
    </Shell>
  );
}
