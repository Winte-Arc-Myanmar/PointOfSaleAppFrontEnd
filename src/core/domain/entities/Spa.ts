export interface SpaPackageItem {
  variantId: string;
  name: string;
  quantity: number;
}

export interface SpaPackage {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  items: SpaPackageItem[];
}

export interface SpaPackageInput {
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  items: { variantId: string; quantity: number }[];
}

export type SpaRoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "OUT_OF_SERVICE";

export interface SpaRoom {
  id: string;
  tenantId: string;
  locationId: string;
  roomNumber: string;
  name: string | null;
  capacity: number;
  status: SpaRoomStatus;
}

export interface SpaRoomInput {
  locationId: string;
  roomNumber: string;
  name: string | null;
  capacity: number;
  status?: "AVAILABLE" | "OUT_OF_SERVICE";
}
