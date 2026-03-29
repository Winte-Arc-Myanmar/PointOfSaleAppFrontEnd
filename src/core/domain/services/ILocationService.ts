/**
 * Location service interface.
 */

import type { Location, LocationTreeNode } from "../entities/Location";
import type { LocationDto } from "@/core/application/dtos/LocationDto";
import type { GetLocationsParams } from "../repositories/ILocationRepository";

export interface ILocationService {
  getAll(params?: GetLocationsParams): Promise<Location[]>;
  getTree(): Promise<LocationTreeNode[]>;
  getById(id: string): Promise<Location | null>;
  create(data: Omit<LocationDto, "id" | "subLocations">): Promise<Location>;
  update(
    id: string,
    data: Omit<LocationDto, "id" | "subLocations">
  ): Promise<Location>;
  delete(id: string): Promise<void>;
}
