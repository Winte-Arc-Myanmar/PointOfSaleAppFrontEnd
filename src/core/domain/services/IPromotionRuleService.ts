import type { PromotionRule } from "../entities/PromotionRule";
import type { PromotionRuleDto } from "@/core/application/dtos/PromotionRuleDto";
import type { GetPromotionRulesParams } from "../repositories/IPromotionRuleRepository";
import type { PaginatedResult } from "../types/pagination";


export interface IPromotionRuleService {
  getAll(params?: GetPromotionRulesParams): Promise<PaginatedResult<PromotionRule>>;
  getById(id: string): Promise<PromotionRule | null>;
  create(
    data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
  ): Promise<PromotionRule>;
  update(
    id: string,
    data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
  ): Promise<PromotionRule>;
  delete(id: string): Promise<void>;
}

