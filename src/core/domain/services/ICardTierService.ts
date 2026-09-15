import type { CardTier } from "../entities/CardTier";
import type { CardTierWriteDto } from "@/core/application/dtos/CardTierDto";
import type { GetCardTiersParams } from "../repositories/ICardTierRepository";
import type { PaginatedResult } from "../types/pagination";

export interface ICardTierService {
  getAll(params?: GetCardTiersParams): Promise<PaginatedResult<CardTier>>;
  getById(id: string): Promise<CardTier | null>;
  create(data: CardTierWriteDto): Promise<CardTier>;
  update(id: string, data: CardTierWriteDto): Promise<CardTier>;
  delete(id: string): Promise<void>;
}
