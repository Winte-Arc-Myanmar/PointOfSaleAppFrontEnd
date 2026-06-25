/**
 * Customer interaction repository
 * Infrastructure layer.
 */

import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import type {
  GetCustomerInteractionsParams,
  ICustomerInteractionRepository,
} from "@/core/domain/repositories/ICustomerInteractionRepository";
import type { CustomerInteractionDto } from "@/core/application/dtos/CustomerInteractionDto";
import { toCustomerInteraction } from "@/core/application/mappers/CustomerInteractionMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiCustomerInteractionRepository
  implements ICustomerInteractionRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    customerId: string,
    params?: GetCustomerInteractionsParams
  ): Promise<PaginatedResult<CustomerInteraction>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const endpoints = API_ENDPOINTS.CUSTOMERS.INTERACTIONS(customerId);
    const res = await this.httpClient.get<unknown>(endpoints.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<CustomerInteractionDto>(res, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toCustomerInteraction(dto as CustomerInteractionDto & { id: string }, customerId),
      (dto) => !!dto?.id,
    );
  }

  async getById(
    customerId: string,
    id: string
  ): Promise<CustomerInteraction | null> {
    try {
      const endpoints = API_ENDPOINTS.CUSTOMERS.INTERACTIONS(customerId);
      const dto = await this.httpClient.get<CustomerInteractionDto>(
        endpoints.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toCustomerInteraction(
        dto as CustomerInteractionDto & { id: string },
        customerId
      );
    } catch {
      return null;
    }
  }

  async create(
    customerId: string,
    data: Omit<CustomerInteractionDto, "id" | "customerId">
  ): Promise<CustomerInteraction> {
    const endpoints = API_ENDPOINTS.CUSTOMERS.INTERACTIONS(customerId);
    const dto = await this.httpClient.post<CustomerInteractionDto>(
      endpoints.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create interaction response missing id");
    return toCustomerInteraction(
      dto as CustomerInteractionDto & { id: string },
      customerId
    );
  }

  async update(
    customerId: string,
    id: string,
    data: Omit<CustomerInteractionDto, "id" | "customerId">
  ): Promise<CustomerInteraction> {
    const endpoints = API_ENDPOINTS.CUSTOMERS.INTERACTIONS(customerId);
    const dto = await this.httpClient.patch<CustomerInteractionDto>(
      endpoints.UPDATE(id),
      data
    );
    return toCustomerInteraction(
      { ...dto, id: dto?.id ?? id } as CustomerInteractionDto & { id: string },
      customerId
    );
  }

  async delete(customerId: string, id: string): Promise<void> {
    const endpoints = API_ENDPOINTS.CUSTOMERS.INTERACTIONS(customerId);
    await this.httpClient.delete(endpoints.DELETE(id));
  }
}


