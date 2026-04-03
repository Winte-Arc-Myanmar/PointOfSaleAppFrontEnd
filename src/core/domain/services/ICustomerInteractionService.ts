/**
 * Customer interaction service interface.
 * Domain layer.
 */

import type { CustomerInteraction } from "../entities/CustomerInteraction";
import type { CustomerInteractionDto } from "@/core/application/dtos/CustomerInteractionDto";
import type { GetCustomerInteractionsParams } from "../repositories/ICustomerInteractionRepository";

export interface ICustomerInteractionService {
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
