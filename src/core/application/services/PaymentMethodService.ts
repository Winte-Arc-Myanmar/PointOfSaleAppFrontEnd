import type { IPaymentMethodService } from "@/core/domain/services/IPaymentMethodService";
import type { IPaymentMethodRepository } from "@/core/domain/repositories/IPaymentMethodRepository";
import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";
import type { GetPaymentMethodsParams } from "@/core/domain/repositories/IPaymentMethodRepository";
import type { PaymentMethodDto } from "../dtos/PaymentMethodDto";

export class PaymentMethodService implements IPaymentMethodService {
  constructor(private readonly paymentMethodRepository: IPaymentMethodRepository) {}

  getAll(params?: GetPaymentMethodsParams): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.getAll(params);
  }

  getById(id: string): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.getById(id);
  }

  create(data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">): Promise<PaymentMethod> {
    return this.paymentMethodRepository.create(data);
  }

  update(
    id: string,
    data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethod> {
    return this.paymentMethodRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.paymentMethodRepository.delete(id);
  }
}

