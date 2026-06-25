/**
 * Branch service interface.
 * Domain layer - defines the contract for branch operations.
 */

import type { Branch } from "../entities/Branch";
import type { BranchDto } from "@/core/application/dtos/BranchDto";
import type { GetBranchesParams } from "../repositories/IBranchRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IBranchService {
  getAll(params?: GetBranchesParams): Promise<PaginatedResult<Branch>>;
  getById(id: string): Promise<Branch | null>;
  create(data: Omit<BranchDto, "id">): Promise<Branch>;
  update(id: string, data: Omit<BranchDto, "id">): Promise<Branch>;
  delete(id: string): Promise<void>;
}
