import type { PaymentMethod } from "../entities/PaymentMethod";
import type { PaymentMethodDto } from "@/core/application/dtos/PaymentMethodDto";
import type { GetPaymentMethodsParams } from "../repositories/IPaymentMethodRepository";
import type { PaginatedResult } from "../types/pagination";


export interface IPaymentMethodService {
  getAll(params?: GetPaymentMethodsParams): Promise<PaginatedResult<PaymentMethod>>;
  getById(id: string): Promise<PaymentMethod | null>;
  create(data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">): Promise<PaymentMethod>;
  update(
    id: string,
    data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
}

