import type { PaymentMethod } from "../entities/PaymentMethod";
import type { PaymentMethodDto } from "@/core/application/dtos/PaymentMethodDto";

export interface GetPaymentMethodsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IPaymentMethodRepository {
  getAll(params?: GetPaymentMethodsParams): Promise<PaymentMethod[]>;
  getById(id: string): Promise<PaymentMethod | null>;
  create(data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">): Promise<PaymentMethod>;
  update(
    id: string,
    data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
}

