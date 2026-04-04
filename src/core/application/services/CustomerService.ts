/**
 * Customer service implementation.
 * Application layer - delegates to ICustomerRepository.
 */

import type { Customer } from "@/core/domain/entities/Customer";
import type {
  GetCustomersParams,
  ICustomerRepository,
} from "@/core/domain/repositories/ICustomerRepository";
import type { ICustomerService } from "@/core/domain/services/ICustomerService";
import type { CustomerDto } from "../dtos/CustomerDto";

export class CustomerService implements ICustomerService {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async getAll(params?: GetCustomersParams): Promise<Customer[]> {
    return this.customerRepository.getAll(params);
  }

  async getById(id: string): Promise<Customer | null> {
    return this.customerRepository.getById(id);
  }

  async create(data: Omit<CustomerDto, "id">): Promise<Customer> {
    return this.customerRepository.create(data);
  }

  async update(id: string, data: Omit<CustomerDto, "id">): Promise<Customer> {
    return this.customerRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.customerRepository.delete(id);
  }
}

