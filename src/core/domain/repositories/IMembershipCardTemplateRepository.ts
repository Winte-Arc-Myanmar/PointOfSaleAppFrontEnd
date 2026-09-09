/**
 * Membership card template repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { MembershipCardTemplate } from "../entities/MembershipCardTemplate";
import type { MembershipCardTemplateDto } from "@/core/application/dtos/MembershipCardTemplateDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetMembershipCardTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IMembershipCardTemplateRepository {
  getAll(
    params?: GetMembershipCardTemplatesParams,
  ): Promise<PaginatedResult<MembershipCardTemplate>>;
  getById(id: string): Promise<MembershipCardTemplate | null>;
  create(
    data: Omit<
      MembershipCardTemplateDto,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ): Promise<MembershipCardTemplate>;
  update(
    id: string,
    data: Omit<
      MembershipCardTemplateDto,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ): Promise<MembershipCardTemplate>;
  delete(id: string): Promise<void>;
}
