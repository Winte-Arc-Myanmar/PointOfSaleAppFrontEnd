/**
 * Membership card category service implementation.
 * Application layer - delegates to IMembershipCardCategoryRepository.
 */

import type { IMembershipCardCategoryService } from "@/core/domain/services/IMembershipCardCategoryService";
import type { IMembershipCardCategoryRepository } from "@/core/domain/repositories/IMembershipCardCategoryRepository";
import type { MembershipCardCategory } from "@/core/domain/entities/MembershipCardCategory";
import type { MembershipCardCategoryDto } from "../dtos/MembershipCardCategoryDto";
import type { GetMembershipCardCategoriesParams } from "@/core/domain/repositories/IMembershipCardCategoryRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class MembershipCardCategoryService
  implements IMembershipCardCategoryService
{
  constructor(
    private readonly membershipCardCategoryRepository: IMembershipCardCategoryRepository,
  ) {}

  async getAll(
    params?: GetMembershipCardCategoriesParams,
  ): Promise<PaginatedResult<MembershipCardCategory>> {
    return this.membershipCardCategoryRepository.getAll(params);
  }

  async getTree(): Promise<MembershipCardCategory[]> {
    return this.membershipCardCategoryRepository.getTree();
  }

  async getById(id: string): Promise<MembershipCardCategory | null> {
    return this.membershipCardCategoryRepository.getById(id);
  }

  async create(
    data: Omit<MembershipCardCategoryDto, "id">,
  ): Promise<MembershipCardCategory> {
    return this.membershipCardCategoryRepository.create(data);
  }

  async update(
    id: string,
    data: Omit<MembershipCardCategoryDto, "id">,
  ): Promise<MembershipCardCategory> {
    return this.membershipCardCategoryRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.membershipCardCategoryRepository.delete(id);
  }
}
