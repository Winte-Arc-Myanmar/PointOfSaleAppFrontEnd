/**
 * Branch service implementation.
 * Application layer - delegates to IBranchRepository.
 */

import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { IBranchRepository } from "@/core/domain/repositories/IBranchRepository";
import type { BranchDto } from "../dtos/BranchDto";
import type { GetBranchesParams } from "@/core/domain/repositories/IBranchRepository";

export class BranchService implements IBranchService {
  constructor(private readonly branchRepository: IBranchRepository) {}

  async getAll(params?: GetBranchesParams) {
    return this.branchRepository.getAll(params);
  }

  async getById(id: string) {
    return this.branchRepository.getById(id);
  }

  async create(data: Omit<BranchDto, "id">) {
    return this.branchRepository.create(data);
  }

  async update(id: string, data: Omit<BranchDto, "id">) {
    return this.branchRepository.update(id, data);
  }

  async delete(id: string) {
    return this.branchRepository.delete(id);
  }
}
