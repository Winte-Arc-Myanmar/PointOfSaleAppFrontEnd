import type { VenueSetting, VenueSettingUpdate } from "@/core/domain/entities/VenueSetting";

export interface IVenueSettingRepository {
  get(): Promise<VenueSetting>;
  update(data: VenueSettingUpdate): Promise<VenueSetting>;
}
