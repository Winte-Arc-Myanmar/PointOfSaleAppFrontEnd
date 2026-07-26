import type {
  IVendorInvoiceRepository,
  GetVendorInvoicesParams,
  VendorInvoiceWriteDto,
} from "@/core/domain/repositories/IVendorInvoiceRepository";
import type { VendorInvoice } from "@/core/domain/entities/VendorInvoice";
import type { VendorInvoiceDto } from "@/core/application/dtos/VendorInvoiceDto";
import { toVendorInvoice } from "@/core/application/mappers/VendorInvoiceMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiAmountString(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string")
    n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function normalizeWritePayload(
  data: VendorInvoiceWriteDto,
): Record<string, unknown> {
  return {
    tenantId: data.tenantId,
    vendorId: data.vendorId,
    invoiceNumber: data.invoiceNumber,
    invoiceType: data.invoiceType,
    totalAmount: toApiAmountString(data.totalAmount),
    matchedPoId: data.matchedPoId,
    matchedGrnId: data.matchedGrnId,
  };
}

export class ApiVendorInvoiceRepository implements IVendorInvoiceRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetVendorInvoicesParams,
  ): Promise<PaginatedResult<VendorInvoice>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.VENDOR_INVOICES.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<VendorInvoiceDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toVendorInvoice(dto as VendorInvoiceDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<VendorInvoice | null> {
    try {
      const dto = await this.httpClient.get<VendorInvoiceDto>(
        API_ENDPOINTS.VENDOR_INVOICES.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toVendorInvoice(dto as VendorInvoiceDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: VendorInvoiceWriteDto): Promise<VendorInvoice> {
    const dto = await this.httpClient.post<VendorInvoiceDto>(
      API_ENDPOINTS.VENDOR_INVOICES.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id) throw new Error("Create vendor invoice response missing id");
    return toVendorInvoice(dto as VendorInvoiceDto & { id: string });
  }

  async update(
    id: string,
    data: VendorInvoiceWriteDto,
  ): Promise<VendorInvoice> {
    const dto = await this.httpClient.patch<VendorInvoiceDto>(
      API_ENDPOINTS.VENDOR_INVOICES.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toVendorInvoice({
      ...dto,
      id: dto?.id ?? id,
    } as VendorInvoiceDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.VENDOR_INVOICES.DELETE(id));
  }
}
