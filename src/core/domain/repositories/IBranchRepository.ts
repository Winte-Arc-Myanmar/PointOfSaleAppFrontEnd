/**
 * Branch repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Branch } from "../entities/Branch";
import type { BranchDto } from "@/core/application/dtos/BranchDto";

export interface GetBranchesParams {
  page?: number;
  limit?: number;
}

export interface IBranchRepository {
  getAll(params?: GetBranchesParams): Promise<Branch[]>;
  getById(id: string): Promise<Branch | null>;
  create(data: Omit<BranchDto, "id">): Promise<Branch>;
  update(id: string, data: Omit<BranchDto, "id">): Promise<Branch>;
  delete(id: string): Promise<void>;
}
