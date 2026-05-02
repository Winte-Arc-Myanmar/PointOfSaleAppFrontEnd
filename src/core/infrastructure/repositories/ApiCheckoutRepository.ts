import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import type { ICheckoutRepository } from "@/core/domain/repositories/ICheckoutRepository";
import type { CheckoutRequestDto, CheckoutResultDto } from "@/core/application/dtos/CheckoutDto";
import { toCheckoutResult } from "@/core/application/mappers/CheckoutMapper";
import type { CheckoutResult } from "@/core/domain/entities/CheckoutResult";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(data: CheckoutRequestDto): Record<string, unknown> {
  return {
    ...data,
    customerId: data.customerId ?? null,
    items: Array.isArray(data.items)
      ? data.items.map((it) => ({
          variantId: it.variantId,
          quantity: toApiDecimalStringFixed4(it.quantity),
          ...(it.lineDiscount != null ? { lineDiscount: toApiDecimalStringFixed4(it.lineDiscount) } : {}),
        }))
      : [],
    payments: Array.isArray(data.payments)
      ? data.payments.map((p) => ({
          paymentMethodId: p.paymentMethodId,
          amount: toApiDecimalStringFixed4(p.amount),
          ...(p.transactionReference != null && String(p.transactionReference).trim()
            ? { transactionReference: p.transactionReference }
            : {}),
        }))
      : [],
  };
}

export class ApiCheckoutRepository implements ICheckoutRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async process(data: CheckoutRequestDto): Promise<CheckoutResult> {
    const dto = await this.httpClient.post<CheckoutResultDto>(
      API_ENDPOINTS.CHECKOUT.PROCESS,
      normalizeWritePayload(data)
    );
    return toCheckoutResult(dto);
  }

  async void(orderId: string): Promise<CheckoutResult> {
    const dto = await this.httpClient.post<CheckoutResultDto>(API_ENDPOINTS.CHECKOUT.VOID(orderId));
    return toCheckoutResult(dto);
  }
}


