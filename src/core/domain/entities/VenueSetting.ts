export type RoomPaymentTiming = "PAY_WHEN_ORDERING" | "PAY_AT_END";

export interface VenueSetting {
  tenantId: string;
  spaEnabled: boolean;
  spaMenuOrdering: boolean;
  ktvEnabled: boolean;
  ktvMenuOrdering: boolean;
  paymentTiming: RoomPaymentTiming;
  roomCardOnly: boolean;
  updatedAt: string | null;
}

export type VenueSettingUpdate = Partial<Omit<VenueSetting, "tenantId" | "updatedAt">>;
