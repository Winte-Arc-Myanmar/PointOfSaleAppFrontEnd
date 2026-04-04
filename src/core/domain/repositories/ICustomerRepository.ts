/**
 * Customer repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Customer } from "../entities/Customer";
import type { CustomerDto } from "@/core/application/dtos/CustomerDto";

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ICustomerRepository {
  getAll(params?: GetCustomersParams): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  create(data: Omit<CustomerDto, "id">): Promise<Customer>;
  update(id: string, data: Omit<CustomerDto, "id">): Promise<Customer>;
  delete(id: string): Promise<void>;
}

