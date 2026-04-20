import type { ICheckoutService } from "@/core/domain/services/ICheckoutService";
import type { ICheckoutRepository } from "@/core/domain/repositories/ICheckoutRepository";
import type { CheckoutRequestDto } from "@/core/application/dtos/CheckoutDto";
import type { CheckoutResult } from "@/core/domain/entities/CheckoutResult";

export class CheckoutService implements ICheckoutService {
  constructor(private readonly checkoutRepository: ICheckoutRepository) {}

  process(data: CheckoutRequestDto): Promise<CheckoutResult> {
    return this.checkoutRepository.process(data);
  }

  void(orderId: string): Promise<CheckoutResult> {
    return this.checkoutRepository.void(orderId);
  }
}

