/**
 * Location service interface.
 */

import type { Location, LocationTreeNode } from "../entities/Location";
import type { LocationDto } from "@/core/application/dtos/LocationDto";
import type { GetLocationsParams } from "../repositories/ILocationRepository";
import type { PaginatedResult } from "../types/pagination";

export interface ILocationService {
  getAll(params?: GetLocationsParams): Promise<PaginatedResult<Location>>;
  getTree(): Promise<LocationTreeNode[]>;
  getById(id: string): Promise<Location | null>;
  create(data: Omit<LocationDto, "id" | "subLocations">): Promise<Location>;
  update(
    id: string,
    data: Omit<LocationDto, "id" | "subLocations">
  ): Promise<Location>;
  delete(id: string): Promise<void>;
}
