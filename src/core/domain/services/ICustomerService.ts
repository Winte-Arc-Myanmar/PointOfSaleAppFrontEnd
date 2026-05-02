/**
 * Customer service interface.
 * Domain layer - defines the contract for customer operations.
 */

import type { Customer } from "../entities/Customer";
import type { CustomerDto } from "@/core/application/dtos/CustomerDto";
import type { GetCustomersParams } from "../repositories/ICustomerRepository";

export interface ICustomerService {
  getAll(params?: GetCustomersParams): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  create(data: Omit<CustomerDto, "id">): Promise<Customer>;
  update(id: string, data: Omit<CustomerDto, "id">): Promise<Customer>;
  delete(id: string): Promise<void>;
}
