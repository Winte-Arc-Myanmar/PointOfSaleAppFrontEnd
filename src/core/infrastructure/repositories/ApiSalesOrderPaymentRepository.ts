import type {
  ISalesOrderPaymentRepository,
  GetSalesOrderPaymentsParams,
} from "@/core/domain/repositories/ISalesOrderPaymentRepository";
import type { SalesOrderPayment } from "@/core/domain/entities/SalesOrderPayment";
import type { SalesOrderPaymentDto } from "@/core/application/dtos/SalesOrderPaymentDto";
import { toSalesOrderPayment } from "@/core/application/mappers/SalesOrderPaymentMapper";
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
  data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
): Record<string, unknown> {
  return {
    ...data,
    amount: toApiDecimalStringFixed4((data as any).amount),
  };
}

export class ApiSalesOrderPaymentRepository implements ISalesOrderPaymentRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    salesOrderId: string,
    params?: GetSalesOrderPaymentsParams
  ): Promise<SalesOrderPayment[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    };
    const res = await this.httpClient.get<
      SalesOrderPaymentDto[] | { data?: SalesOrderPaymentDto[] }
    >(API_ENDPOINTS.SALES_ORDERS.PAYMENTS(salesOrderId).LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is SalesOrderPaymentDto & { id: string } => !!d?.id)
      .map((d) => toSalesOrderPayment(salesOrderId, d as any));
  }

  async getById(
    salesOrderId: string,
    id: string
  ): Promise<SalesOrderPayment | null> {
    try {
      const dto = await this.httpClient.get<SalesOrderPaymentDto>(
        API_ENDPOINTS.SALES_ORDERS.PAYMENTS(salesOrderId).BY_ID(id)
      );
      if (!dto?.id) return null;
      return toSalesOrderPayment(salesOrderId, dto as any);
    } catch {
      return null;
    }
  }

  async create(
    salesOrderId: string,
    data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
  ): Promise<SalesOrderPayment> {
    const dto = await this.httpClient.post<SalesOrderPaymentDto>(
      API_ENDPOINTS.SALES_ORDERS.PAYMENTS(salesOrderId).CREATE,
      normalizeWritePayload(data)
    );
    if (!dto?.id) throw new Error("Create payment response missing id");
    return toSalesOrderPayment(salesOrderId, dto as any);
  }

  async update(
    salesOrderId: string,
    id: string,
    data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
  ): Promise<SalesOrderPayment> {
    const dto = await this.httpClient.patch<SalesOrderPaymentDto>(
      API_ENDPOINTS.SALES_ORDERS.PAYMENTS(salesOrderId).UPDATE(id),
      normalizeWritePayload(data)
    );
    return toSalesOrderPayment(
      salesOrderId,
      { ...(dto as any), id: (dto as any)?.id ?? id } as any
    );
  }

  async delete(salesOrderId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.SALES_ORDERS.PAYMENTS(salesOrderId).DELETE(id)
    );
  }
}



