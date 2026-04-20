import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import type { IRefundRepository } from "@/core/domain/repositories/IRefundRepository";
import type { RefundRequestDto, RefundDto } from "@/core/application/dtos/RefundDto";
import { toRefund } from "@/core/application/mappers/RefundMapper";
import type { Refund } from "@/core/domain/entities/Refund";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(data: RefundRequestDto): Record<string, unknown> {
  return {
    ...data,
    items: Array.isArray(data.items)
      ? data.items.map((it) => ({
          salesOrderLineId: it.salesOrderLineId,
          returnedQuantity: toApiDecimalStringFixed4(it.returnedQuantity),
        }))
      : [],
  };
}

export class ApiRefundRepository implements IRefundRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async create(data: RefundRequestDto): Promise<Refund> {
    const dto = await this.httpClient.post<RefundDto>(
      API_ENDPOINTS.REFUNDS.CREATE,
      normalizeWritePayload(data)
    );
    return toRefund(dto);
  }

  async getById(id: string): Promise<Refund | null> {
    try {
      const dto = await this.httpClient.get<RefundDto>(API_ENDPOINTS.REFUNDS.BY_ID(id));
      if (!dto?.returnId) return null;
      return toRefund(dto);
    } catch {
      return null;
    }
  }

  async getBySalesOrderId(salesOrderId: string): Promise<Refund[]> {
    const res = await this.httpClient.get<RefundDto[] | { data?: RefundDto[] }>(
      API_ENDPOINTS.REFUNDS.BY_ORDER_ID(salesOrderId)
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos.filter((d) => !!d?.returnId).map((d) => toRefund(d as RefundDto));
  }
}

