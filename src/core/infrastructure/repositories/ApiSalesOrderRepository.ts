import type {
  ISalesOrderRepository,
  GetSalesOrdersParams,
} from "@/core/domain/repositories/ISalesOrderRepository";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import type { SalesOrderDto } from "@/core/application/dtos/SalesOrderDto";
import { toSalesOrder } from "@/core/application/mappers/SalesOrderMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(
  data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
): Record<string, unknown> {
  return {
    ...data,
    subtotal: toApiDecimalStringFixed4((data as any).subtotal),
    totalDiscount: toApiDecimalStringFixed4((data as any).totalDiscount),
    totalTax: toApiDecimalStringFixed4((data as any).totalTax),
    grandTotal: toApiDecimalStringFixed4((data as any).grandTotal),
  };
}

export class ApiSalesOrderRepository implements ISalesOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetSalesOrdersParams): Promise<SalesOrder[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.customerId ? { customerId: params.customerId } : {}),
      ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
      ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
    };

    const res = await this.httpClient.get<
      SalesOrderDto[] | { data?: SalesOrderDto[] }
    >(API_ENDPOINTS.SALES_ORDERS.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is SalesOrderDto & { id: string } => !!dto?.id)
      .map((d) => toSalesOrder(d as any));
  }

  async getById(id: string): Promise<SalesOrder | null> {
    try {
      const dto = await this.httpClient.get<SalesOrderDto>(
        API_ENDPOINTS.SALES_ORDERS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toSalesOrder(dto as any);
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder> {
    const dto = await this.httpClient.post<SalesOrderDto>(
      API_ENDPOINTS.SALES_ORDERS.CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create sales order response missing id");
    return toSalesOrder(dto as any);
  }

  async update(
    id: string,
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder> {
    const dto = await this.httpClient.patch<SalesOrderDto>(
      API_ENDPOINTS.SALES_ORDERS.UPDATE(id),
      normalizeWritePayload(data)
    );
    return toSalesOrder({ ...(dto as any), id: (dto as any)?.id ?? id } as any);
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.SALES_ORDERS.DELETE(id));
  }
}



