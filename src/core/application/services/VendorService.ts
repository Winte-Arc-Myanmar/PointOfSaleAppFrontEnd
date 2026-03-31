/**
 * Vendor service implementation.
 * Application layer - delegates to IVendorRepository.
 */

import type { Vendor } from "@/core/domain/entities/Vendor";
import type { IVendorRepository, GetVendorsParams } from "@/core/domain/repositories/IVendorRepository";
import type { IVendorService } from "@/core/domain/services/IVendorService";
import type { VendorDto } from "../dtos/VendorDto";

export class VendorService implements IVendorService {
  constructor(private readonly vendorRepository: IVendorRepository) {}

  async getAll(params?: GetVendorsParams): Promise<Vendor[]> {
    return this.vendorRepository.getAll(params);
  }

  async getById(id: string): Promise<Vendor | null> {
    return this.vendorRepository.getById(id);
  }

  async create(data: Omit<VendorDto, "id">): Promise<Vendor> {
    return this.vendorRepository.create(data);
  }

  async update(id: string, data: Omit<VendorDto, "id">): Promise<Vendor> {
    return this.vendorRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.vendorRepository.delete(id);
  }
}

