/**
 * Loyalty ledger repository
 * Infrastructure layer.
 */

import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";
import type {
  GetLoyaltyLedgerParams,
  ILoyaltyLedgerRepository,
} from "@/core/domain/repositories/ILoyaltyLedgerRepository";
import type { LoyaltyLedgerEntryDto } from "@/core/application/dtos/LoyaltyLedgerEntryDto";
import { toLoyaltyLedgerEntry } from "@/core/application/mappers/LoyaltyLedgerEntryMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiLoyaltyLedgerRepository implements ILoyaltyLedgerRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    customerId: string,
    params?: GetLoyaltyLedgerParams
  ): Promise<PaginatedResult<LoyaltyLedgerEntry>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const endpoints = API_ENDPOINTS.CUSTOMERS.LOYALTY_LEDGER(customerId);
    const res = await this.httpClient.get<unknown>(endpoints.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<LoyaltyLedgerEntryDto>(res, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toLoyaltyLedgerEntry(dto as LoyaltyLedgerEntryDto & { id: string }, customerId),
      (dto) => !!dto?.id,
    );
  }

  async getById(
    customerId: string,
    id: string
  ): Promise<LoyaltyLedgerEntry | null> {
    try {
      const endpoints = API_ENDPOINTS.CUSTOMERS.LOYALTY_LEDGER(customerId);
      const dto = await this.httpClient.get<LoyaltyLedgerEntryDto>(
        endpoints.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toLoyaltyLedgerEntry(
        dto as LoyaltyLedgerEntryDto & { id: string },
        customerId
      );
    } catch {
      return null;
    }
  }

  async create(
    customerId: string,
    data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">
  ): Promise<LoyaltyLedgerEntry> {
    const endpoints = API_ENDPOINTS.CUSTOMERS.LOYALTY_LEDGER(customerId);
    const dto = await this.httpClient.post<LoyaltyLedgerEntryDto>(
      endpoints.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create loyalty ledger response missing id");
    return toLoyaltyLedgerEntry(
      dto as LoyaltyLedgerEntryDto & { id: string },
      customerId
    );
  }

  async update(
    customerId: string,
    id: string,
    data: Omit<LoyaltyLedgerEntryDto, "id" | "customerId">
  ): Promise<LoyaltyLedgerEntry> {
    const endpoints = API_ENDPOINTS.CUSTOMERS.LOYALTY_LEDGER(customerId);
    const dto = await this.httpClient.patch<LoyaltyLedgerEntryDto>(
      endpoints.UPDATE(id),
      data
    );
    return toLoyaltyLedgerEntry(
      { ...dto, id: dto?.id ?? id } as LoyaltyLedgerEntryDto & { id: string },
      customerId
    );
  }

  async delete(customerId: string, id: string): Promise<void> {
    const endpoints = API_ENDPOINTS.CUSTOMERS.LOYALTY_LEDGER(customerId);
    await this.httpClient.delete(endpoints.DELETE(id));
  }
}


