import type {
  VoidReasonCreateDto,
  VoidReasonUpdateDto,
} from "@/core/application/dtos/VoidReasonDto";
import type { VoidReason } from "@/core/domain/entities/VoidReason";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface GetVoidReasonsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  activeOnly?: boolean;
}

export interface IVoidReasonRepository {
  getAll(params?: GetVoidReasonsParams): Promise<PaginatedResult<VoidReason>>;
  getById(id: string): Promise<VoidReason | null>;
  create(data: VoidReasonCreateDto): Promise<VoidReason>;
  update(id: string, data: VoidReasonUpdateDto): Promise<VoidReason>;
  delete(id: string): Promise<void>;
}
