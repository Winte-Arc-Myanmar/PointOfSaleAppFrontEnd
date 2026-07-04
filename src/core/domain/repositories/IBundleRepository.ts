import type {
  BundleCreateDto,
  BundleUpdateDto,
} from "@/core/application/dtos/BundleDto";
import type { Bundle } from "../entities/Bundle";
import type { PaginatedResult } from "../types/pagination";

export interface GetBundlesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IBundleRepository {
  getAll(params?: GetBundlesParams): Promise<PaginatedResult<Bundle>>;
  getById(id: string): Promise<Bundle | null>;
  create(data: BundleCreateDto): Promise<Bundle>;
  update(id: string, data: BundleUpdateDto): Promise<Bundle>;
  delete(id: string): Promise<void>;
}
