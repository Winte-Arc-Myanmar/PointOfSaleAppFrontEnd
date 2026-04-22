/**
 * Customer repository
 * Infrastructure layer.
 */

import type { Customer } from "@/core/domain/entities/Customer";
import type {
  GetCustomersParams,
  ICustomerRepository,
} from "@/core/domain/repositories/ICustomerRepository";
import type { CustomerDto } from "@/core/application/dtos/CustomerDto";
import { toCustomer } from "@/core/application/mappers/CustomerMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiCustomerRepository implements ICustomerRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetCustomersParams): Promise<Customer[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
    };
    const res = await this.httpClient.get<
      CustomerDto[] | { data?: CustomerDto[] }
    >(API_ENDPOINTS.CUSTOMERS.LIST, { params: query });
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is CustomerDto & { id: string } => !!dto?.id)
      .map(toCustomer);
  }

  async getById(id: string): Promise<Customer | null> {
    try {
      const dto = await this.httpClient.get<CustomerDto>(
        API_ENDPOINTS.CUSTOMERS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toCustomer(dto as CustomerDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<CustomerDto, "id">): Promise<Customer> {
    const dto = await this.httpClient.post<CustomerDto>(
      API_ENDPOINTS.CUSTOMERS.CREATE,
      data,
    );
    if (!dto?.id) throw new Error("Create customer response missing id");
    return toCustomer(dto as CustomerDto & { id: string });
  }

  async update(id: string, data: Omit<CustomerDto, "id">): Promise<Customer> {
    const dto = await this.httpClient.patch<CustomerDto>(
      API_ENDPOINTS.CUSTOMERS.UPDATE(id),
      data,
    );
    return toCustomer({ ...dto, id: dto?.id ?? id } as CustomerDto & {
      id: string;
    });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id));
  }
}
