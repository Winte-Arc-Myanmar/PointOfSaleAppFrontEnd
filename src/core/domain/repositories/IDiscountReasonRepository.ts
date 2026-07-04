import type {
  DiscountReasonCreateDto,
  DiscountReasonUpdateDto,
} from "@/core/application/dtos/DiscountReasonDto";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface GetDiscountReasonsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  activeOnly?: boolean;
}

export interface IDiscountReasonRepository {
  getAll(params?: GetDiscountReasonsParams): Promise<PaginatedResult<DiscountReason>>;
  getById(id: string): Promise<DiscountReason | null>;
  create(data: DiscountReasonCreateDto): Promise<DiscountReason>;
  update(id: string, data: DiscountReasonUpdateDto): Promise<DiscountReason>;
  delete(id: string): Promise<void>;
}
