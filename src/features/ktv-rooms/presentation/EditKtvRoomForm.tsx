"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useKtvRoom, useUpdateKtvRoom } from "@/presentation/hooks/useKtvRooms";
import { useToast } from "@/presentation/providers/ToastProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { KtvRoomForm } from "./KtvRoomForm";

const FORM_ID = "edit-ktv-room-form";

export function EditKtvRoomForm({ roomId }: { roomId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: room, isLoading, error } = useKtvRoom(roomId);
  const update = useUpdateKtvRoom();

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !room) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{apiErrorMessage(error, "KTV room not found.")}</p>
        <Link href="/ktv-rooms">
          <Button variant="outline">Back to KTV rooms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ktv-rooms">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit room {room.roomNumber}</h1>
      </div>
      <p className="text-sm text-muted">Price and time changes apply to the next guests, not to a room already in use.</p>
      <KtvRoomForm
        key={room.id}
        formId={FORM_ID}
        room={room}
        onSubmit={(data) =>
          update.mutate(
            { id: room.id, data },
            {
              onSuccess: () => {
                toast.success("Room saved.");
                router.push("/ktv-rooms");
              },
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't save the room.")),
            },
          )
        }
      />
      <div className="flex gap-2">
        <Button type="submit" form={FORM_ID} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Link href="/ktv-rooms">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
