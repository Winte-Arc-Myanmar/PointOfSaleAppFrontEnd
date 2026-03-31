/**
 * Vendor repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Vendor } from "../entities/Vendor";
import type { VendorDto } from "@/core/application/dtos/VendorDto";

export interface GetVendorsParams {
  page?: number;
  limit?: number;
}

export interface IVendorRepository {
  getAll(params?: GetVendorsParams): Promise<Vendor[]>;
  getById(id: string): Promise<Vendor | null>;
  create(data: Omit<VendorDto, "id">): Promise<Vendor>;
  update(id: string, data: Omit<VendorDto, "id">): Promise<Vendor>;
  delete(id: string): Promise<void>;
}

