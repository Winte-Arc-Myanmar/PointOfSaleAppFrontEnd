/**
 * Vendor service interface.
 * Domain layer - defines the contract for vendor operations.
 */

import type { Vendor } from "../entities/Vendor";
import type { VendorDto } from "@/core/application/dtos/VendorDto";
import type { GetVendorsParams } from "../repositories/IVendorRepository";

export interface IVendorService {
  getAll(params?: GetVendorsParams): Promise<Vendor[]>;
  getById(id: string): Promise<Vendor | null>;
  create(data: Omit<VendorDto, "id">): Promise<Vendor>;
  update(id: string, data: Omit<VendorDto, "id">): Promise<Vendor>;
  delete(id: string): Promise<void>;
}

