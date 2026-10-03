import { Shell } from "@/presentation/components/layout/Shell";
import { SpaRoomList } from "@/features/spa/presentation/SpaRoomList";

export default function SpaRoomsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Your SPA treatment rooms. Guests pay for service packages, not rooms.</p>
        <SpaRoomList />
      </div>
    </Shell>
  );
}
