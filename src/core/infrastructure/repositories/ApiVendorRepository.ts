/**
 * Vendor repository
 * Infrastructure layer.
 */

import type { Vendor } from "@/core/domain/entities/Vendor";
import type {
  GetVendorsParams,
  IVendorRepository,
} from "@/core/domain/repositories/IVendorRepository";
import type { VendorDto } from "@/core/application/dtos/VendorDto";
import { toVendor } from "@/core/application/mappers/VendorMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiVendorRepository implements IVendorRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetVendorsParams): Promise<Vendor[]> {
    const query = { page: params?.page ?? 1, limit: params?.limit ?? 10 };
    const res = await this.httpClient.get<VendorDto[] | { data?: VendorDto[] }>(
      API_ENDPOINTS.VENDORS.LIST,
      { params: query }
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is VendorDto & { id: string } => !!dto?.id)
      .map(toVendor);
  }

  async getById(id: string): Promise<Vendor | null> {
    try {
      const dto = await this.httpClient.get<VendorDto>(
        API_ENDPOINTS.VENDORS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toVendor(dto as VendorDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<VendorDto, "id">): Promise<Vendor> {
    const dto = await this.httpClient.post<VendorDto>(
      API_ENDPOINTS.VENDORS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create vendor response missing id");
    return toVendor(dto as VendorDto & { id: string });
  }

  async update(id: string, data: Omit<VendorDto, "id">): Promise<Vendor> {
    const dto = await this.httpClient.patch<VendorDto>(
      API_ENDPOINTS.VENDORS.UPDATE(id),
      data
    );
    return toVendor({ ...dto, id: dto?.id ?? id } as VendorDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.VENDORS.DELETE(id));
  }
}

