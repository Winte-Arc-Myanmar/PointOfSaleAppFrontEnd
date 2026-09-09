/**
 * Membership card template service interface.
 * Domain layer.
 */

import type { MembershipCardTemplate } from "../entities/MembershipCardTemplate";
import type { MembershipCardTemplateDto } from "@/core/application/dtos/MembershipCardTemplateDto";
import type { GetMembershipCardTemplatesParams } from "../repositories/IMembershipCardTemplateRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IMembershipCardTemplateService {
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
