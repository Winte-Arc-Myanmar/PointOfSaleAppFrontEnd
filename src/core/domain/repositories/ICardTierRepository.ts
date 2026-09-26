import type { CardTier } from "../entities/CardTier";
import type { CardTierWriteDto } from "@/core/application/dtos/CardTierDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetCardTiersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  /** When set (e.g. system admin membership registration), scope list to this tenant. */
  tenantId?: string;
}

export interface ICardTierRepository {
  getAll(params?: GetCardTiersParams): Promise<PaginatedResult<CardTier>>;
  getById(id: string): Promise<CardTier | null>;
  create(data: CardTierWriteDto): Promise<CardTier>;
  update(id: string, data: CardTierWriteDto): Promise<CardTier>;
  delete(id: string): Promise<void>;
}
