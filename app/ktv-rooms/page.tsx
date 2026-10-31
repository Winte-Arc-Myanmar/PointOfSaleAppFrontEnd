import { Shell } from "@/presentation/components/layout/Shell";
import { KtvRoomList } from "@/features/ktv-rooms/presentation/KtvRoomList";

export default function KtvRoomsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Your KTV rooms, how many people they fit, and the price per hour.</p>
        <KtvRoomList />
      </div>
    </Shell>
  );
}
