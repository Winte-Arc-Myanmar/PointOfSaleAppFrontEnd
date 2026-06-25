import type {
  ISalesOrderLineRepository,
  GetSalesOrderLinesParams,
} from "@/core/domain/repositories/ISalesOrderLineRepository";
import type { SalesOrderLine } from "@/core/domain/entities/SalesOrderLine";
import type { SalesOrderLineDto } from "@/core/application/dtos/SalesOrderLineDto";
import { toSalesOrderLine } from "@/core/application/mappers/SalesOrderLineMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(
  data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
): Record<string, unknown> {
  return {
    ...data,
    quantity: toApiDecimalStringFixed4((data as any).quantity),
    unitPrice: toApiDecimalStringFixed4((data as any).unitPrice),
    lineDiscount: toApiDecimalStringFixed4((data as any).lineDiscount),
    taxAmount: toApiDecimalStringFixed4((data as any).taxAmount),
  };
}

export class ApiSalesOrderLineRepository implements ISalesOrderLineRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    salesOrderId: string,
    params?: GetSalesOrderLinesParams
  ): Promise<PaginatedResult<SalesOrderLine>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const res = await this.httpClient.get<unknown>(
      API_ENDPOINTS.SALES_ORDERS.LINES(salesOrderId).LIST,
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
    const parsed = parsePaginatedResponse<SalesOrderLineDto>(res, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toSalesOrderLine(salesOrderId, dto as SalesOrderLineDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(salesOrderId: string, id: string): Promise<SalesOrderLine | null> {
    try {
      const dto = await this.httpClient.get<SalesOrderLineDto>(
        API_ENDPOINTS.SALES_ORDERS.LINES(salesOrderId).BY_ID(id)
      );
      if (!dto?.id) return null;
      return toSalesOrderLine(salesOrderId, dto as any);
    } catch {
      return null;
    }
  }

  async create(
    salesOrderId: string,
    data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
  ): Promise<SalesOrderLine> {
    const dto = await this.httpClient.post<SalesOrderLineDto>(
      API_ENDPOINTS.SALES_ORDERS.LINES(salesOrderId).CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create sales order line response missing id");
    return toSalesOrderLine(salesOrderId, dto as any);
  }

  async update(
    salesOrderId: string,
    id: string,
    data: Omit<SalesOrderLineDto, "id" | "salesOrderId" | "createdAt" | "updatedAt">
  ): Promise<SalesOrderLine> {
    const dto = await this.httpClient.patch<SalesOrderLineDto>(
      API_ENDPOINTS.SALES_ORDERS.LINES(salesOrderId).UPDATE(id),
      normalizeWritePayload(data)
    );
    return toSalesOrderLine(salesOrderId, { ...(dto as any), id: (dto as any)?.id ?? id } as any);
  }

  async delete(salesOrderId: string, id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.SALES_ORDERS.LINES(salesOrderId).DELETE(id));
  }
}



