/**
 * Membership card category service interface.
 * Domain layer.
 */

import type { MembershipCardCategory } from "../entities/MembershipCardCategory";
import type { MembershipCardCategoryDto } from "@/core/application/dtos/MembershipCardCategoryDto";
import type { GetMembershipCardCategoriesParams } from "../repositories/IMembershipCardCategoryRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IMembershipCardCategoryService {
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
