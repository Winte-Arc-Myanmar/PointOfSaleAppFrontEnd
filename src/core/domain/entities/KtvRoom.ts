export type KtvRoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "OUT_OF_SERVICE";
export type RoomRoundingMode = "UP" | "NEAREST" | "DOWN";

export interface KtvRoom {
  id: string;
  tenantId: string;
  locationId: string;
  roomNumber: string;
  name: string | null;
  capacity: number;
  pricePerHour: number;
  minimumMinutes: number;
  incrementMinutes: number;
  graceMinutes: number;
  roundingMode: RoomRoundingMode;
  status: KtvRoomStatus;
}

export interface KtvRoomInput {
  locationId: string;
  roomNumber: string;
  name: string | null;
  capacity: number;
  pricePerHour: number;
  minimumMinutes: number;
  incrementMinutes: number;
  graceMinutes: number;
  roundingMode: RoomRoundingMode;
  status?: "AVAILABLE" | "OUT_OF_SERVICE";
}
