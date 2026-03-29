/**
 * Location repository interface.
 */

import type { Location, LocationTreeNode } from "../entities/Location";
import type { LocationDto } from "@/core/application/dtos/LocationDto";

export interface GetLocationsParams {
  page?: number;
  limit?: number;
}

export interface ILocationRepository {
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
