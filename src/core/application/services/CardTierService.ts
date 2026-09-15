import type { ICardTierService } from "@/core/domain/services/ICardTierService";
import type {
  GetCardTiersParams,
  ICardTierRepository,
} from "@/core/domain/repositories/ICardTierRepository";
import type { CardTier } from "@/core/domain/entities/CardTier";
import type { CardTierWriteDto } from "../dtos/CardTierDto";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class CardTierService implements ICardTierService {
  constructor(private readonly cardTierRepository: ICardTierRepository) {}

  getAll(params?: GetCardTiersParams): Promise<PaginatedResult<CardTier>> {
    return this.cardTierRepository.getAll(params);
  }

  getById(id: string): Promise<CardTier | null> {
    return this.cardTierRepository.getById(id);
  }

  create(data: CardTierWriteDto): Promise<CardTier> {
    return this.cardTierRepository.create(data);
  }

  update(id: string, data: CardTierWriteDto): Promise<CardTier> {
    return this.cardTierRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.cardTierRepository.delete(id);
  }
}
