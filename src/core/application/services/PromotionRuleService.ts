import type { IPromotionRuleService } from "@/core/domain/services/IPromotionRuleService";
import type { IPromotionRuleRepository } from "@/core/domain/repositories/IPromotionRuleRepository";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import type { GetPromotionRulesParams } from "@/core/domain/repositories/IPromotionRuleRepository";
import type { PromotionRuleDto } from "../dtos/PromotionRuleDto";

export class PromotionRuleService implements IPromotionRuleService {
  constructor(private readonly promotionRuleRepository: IPromotionRuleRepository) {}

  getAll(params?: GetPromotionRulesParams): Promise<PromotionRule[]> {
    return this.promotionRuleRepository.getAll(params);
  }

  getById(id: string): Promise<PromotionRule | null> {
    return this.promotionRuleRepository.getById(id);
  }

  create(
    data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
  ): Promise<PromotionRule> {
    return this.promotionRuleRepository.create(data);
  }

  update(
    id: string,
    data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
  ): Promise<PromotionRule> {
    return this.promotionRuleRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.promotionRuleRepository.delete(id);
  }
}

