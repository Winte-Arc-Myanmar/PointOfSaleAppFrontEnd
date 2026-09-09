/**
 * Membership card category repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { MembershipCardCategory } from "../entities/MembershipCardCategory";
import type { MembershipCardCategoryDto } from "@/core/application/dtos/MembershipCardCategoryDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetMembershipCardCategoriesParams {
  page?: number;
  limit?: number;
}

export interface IMembershipCardCategoryRepository {
  getAll(
    params?: GetMembershipCardCategoriesParams,
  ): Promise<PaginatedResult<MembershipCardCategory>>;
  getTree(): Promise<MembershipCardCategory[]>;
  getById(id: string): Promise<MembershipCardCategory | null>;
  create(
    data: Omit<MembershipCardCategoryDto, "id">,
  ): Promise<MembershipCardCategory>;
  update(
    id: string,
    data: Omit<MembershipCardCategoryDto, "id">,
  ): Promise<MembershipCardCategory>;
  delete(id: string): Promise<void>;
}
