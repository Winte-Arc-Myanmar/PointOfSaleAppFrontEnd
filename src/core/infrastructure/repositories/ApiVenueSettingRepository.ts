import type { IVenueSettingRepository } from "@/core/domain/repositories/IVenueSettingRepository";
import type { VenueSetting, VenueSettingUpdate } from "@/core/domain/entities/VenueSetting";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiVenueSettingRepository implements IVenueSettingRepository {
  constructor(private readonly httpClient: HttpClient) {}

  get(): Promise<VenueSetting> {
    return this.httpClient.get<VenueSetting>(API_ENDPOINTS.VENUE_SETTINGS);
  }

  update(data: VenueSettingUpdate): Promise<VenueSetting> {
    return this.httpClient.put<VenueSetting>(API_ENDPOINTS.VENUE_SETTINGS, data);
  }
}
