/**
 * Location service.
 */

import type { ILocationService } from "@/core/domain/services/ILocationService";
import type { ILocationRepository } from "@/core/domain/repositories/ILocationRepository";
import type { LocationDto } from "../dtos/LocationDto";
import type { GetLocationsParams } from "@/core/domain/repositories/ILocationRepository";

export class LocationService implements ILocationService {
  constructor(private readonly locationRepository: ILocationRepository) {}

  getAll(params?: GetLocationsParams) {
    return this.locationRepository.getAll(params);
  }

  getTree() {
    return this.locationRepository.getTree();
  }

  getById(id: string) {
    return this.locationRepository.getById(id);
  }

  create(data: Omit<LocationDto, "id" | "subLocations">) {
    return this.locationRepository.create(data);
  }

  update(id: string, data: Omit<LocationDto, "id" | "subLocations">) {
    return this.locationRepository.update(id, data);
  }

  delete(id: string) {
    return this.locationRepository.delete(id);
  }
}
