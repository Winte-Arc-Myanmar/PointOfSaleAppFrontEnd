import type { PromotionRule } from "../entities/PromotionRule";
import type { PromotionRuleDto, PromotionRuleInput } from "@/core/application/dtos/PromotionRuleDto";
import type { GetPromotionRulesParams } from "../repositories/IPromotionRuleRepository";
import type { PaginatedResult } from "../types/pagination";


export interface IPromotionRuleService {
  getAll(params?: GetPromotionRulesParams): Promise<PaginatedResult<PromotionRule>>;
  getById(id: string): Promise<PromotionRule | null>;
  create(
    data: PromotionRuleInput
  ): Promise<PromotionRule>;
  update(
    id: string,
    data: PromotionRuleInput
  ): Promise<PromotionRule>;
  delete(id: string): Promise<void>;
}

