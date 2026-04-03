/**
 * Customer interaction service implementation.
 * Application layer.
 */

import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import type {
  GetCustomerInteractionsParams,
  ICustomerInteractionRepository,
} from "@/core/domain/repositories/ICustomerInteractionRepository";
import type { ICustomerInteractionService } from "@/core/domain/services/ICustomerInteractionService";
import type { CustomerInteractionDto } from "../dtos/CustomerInteractionDto";

export class CustomerInteractionService implements ICustomerInteractionService {
  constructor(private readonly repository: ICustomerInteractionRepository) {}

  async getAll(
    customerId: string,
    params?: GetCustomerInteractionsParams
  ): Promise<CustomerInteraction[]> {
    return this.repository.getAll(customerId, params);
  }

  async getById(
    customerId: string,
    id: string
  ): Promise<CustomerInteraction | null> {
    return this.repository.getById(customerId, id);
  }

  async create(
    customerId: string,
    data: Omit<CustomerInteractionDto, "id" | "customerId">
  ): Promise<CustomerInteraction> {
    return this.repository.create(customerId, data);
  }

  async update(
    customerId: string,
    id: string,
    data: Omit<CustomerInteractionDto, "id" | "customerId">
  ): Promise<CustomerInteraction> {
    return this.repository.update(customerId, id, data);
  }

  async delete(customerId: string, id: string): Promise<void> {
    return this.repository.delete(customerId, id);
  }
}
