import type { CheckoutRequestDto } from "@/core/application/dtos/CheckoutDto";
import type { CheckoutResult } from "@/core/domain/entities/CheckoutResult";

export interface ICheckoutService {
  process(data: CheckoutRequestDto): Promise<CheckoutResult>;
  void(orderId: string): Promise<CheckoutResult>;
}

