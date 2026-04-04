/**
 * Customer interaction repository interface.
 * Domain layer - nested under a customer.
 */

import type { CustomerInteraction } from "../entities/CustomerInteraction";
import type { CustomerInteractionDto } from "@/core/application/dtos/CustomerInteractionDto";

export interface GetCustomerInteractionsParams {
  page?: number;
  limit?: number;
}

export interface ICustomerInteractionRepository {
  getAll(
    customerId: string,
    params?: GetCustomerInteractionsParams
  ): Promise<CustomerInteraction[]>;
  getById(
    customerId: string,
    id: string
  ): Promise<CustomerInteraction | null>;
  create(
    customerId: string,
    data: Omit<CustomerInteractionDto, "id" | "customerId">
  ): Promise<CustomerInteraction>;
  update(
    customerId: string,
    id: string,
    data: Omit<CustomerInteractionDto, "id" | "customerId">
  ): Promise<CustomerInteraction>;
  delete(customerId: string, id: string): Promise<void>;
}
