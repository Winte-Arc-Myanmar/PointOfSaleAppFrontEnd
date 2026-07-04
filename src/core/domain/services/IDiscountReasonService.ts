import type {
  DiscountReasonCreateDto,
  DiscountReasonUpdateDto,
} from "@/core/application/dtos/DiscountReasonDto";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";
import type { GetDiscountReasonsParams } from "@/core/domain/repositories/IDiscountReasonRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface IDiscountReasonService {
  getAll(params?: GetDiscountReasonsParams): Promise<PaginatedResult<DiscountReason>>;
  getById(id: string): Promise<DiscountReason | null>;
  create(data: DiscountReasonCreateDto): Promise<DiscountReason>;
  update(id: string, data: DiscountReasonUpdateDto): Promise<DiscountReason>;
  delete(id: string): Promise<void>;
}
