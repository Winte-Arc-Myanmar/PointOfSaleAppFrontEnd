/**
 * Membership card template service implementation.
 * Application layer - delegates to IMembershipCardTemplateRepository.
 */

import type { IMembershipCardTemplateService } from "@/core/domain/services/IMembershipCardTemplateService";
import type { IMembershipCardTemplateRepository } from "@/core/domain/repositories/IMembershipCardTemplateRepository";
import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";
import type { MembershipCardTemplateDto } from "../dtos/MembershipCardTemplateDto";
import type { GetMembershipCardTemplatesParams } from "@/core/domain/repositories/IMembershipCardTemplateRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class MembershipCardTemplateService
  implements IMembershipCardTemplateService
{
  constructor(
    private readonly membershipCardTemplateRepository: IMembershipCardTemplateRepository,
  ) {}

  async getAll(
    params?: GetMembershipCardTemplatesParams,
  ): Promise<PaginatedResult<MembershipCardTemplate>> {
    return this.membershipCardTemplateRepository.getAll(params);
  }

  async getById(id: string): Promise<MembershipCardTemplate | null> {
    return this.membershipCardTemplateRepository.getById(id);
  }

  async create(
    data: Omit<
      MembershipCardTemplateDto,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ): Promise<MembershipCardTemplate> {
    return this.membershipCardTemplateRepository.create(data);
  }

  async update(
    id: string,
    data: Omit<
      MembershipCardTemplateDto,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ): Promise<MembershipCardTemplate> {
    return this.membershipCardTemplateRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.membershipCardTemplateRepository.delete(id);
  }
}
