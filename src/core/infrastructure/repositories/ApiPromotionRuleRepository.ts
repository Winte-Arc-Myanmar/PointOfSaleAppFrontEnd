import type {
  IPromotionRuleRepository,
  GetPromotionRulesParams,
} from "@/core/domain/repositories/IPromotionRuleRepository";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import type { PromotionRuleDto } from "@/core/application/dtos/PromotionRuleDto";
import { toPromotionRule } from "@/core/application/mappers/PromotionRuleMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiPromotionRuleRepository implements IPromotionRuleRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetPromotionRulesParams): Promise<PromotionRule[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    };
    const res = await this.httpClient.get<
      PromotionRuleDto[] | { data?: PromotionRuleDto[] }
    >(API_ENDPOINTS.PROMOTION_RULES.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is PromotionRuleDto & { id: string } => !!d?.id)
      .map((d) => toPromotionRule(d as PromotionRuleDto & { id: string }));
  }

  async getById(id: string): Promise<PromotionRule | null> {
    try {
      const dto = await this.httpClient.get<PromotionRuleDto>(
        API_ENDPOINTS.PROMOTION_RULES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toPromotionRule(dto as PromotionRuleDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
  ): Promise<PromotionRule> {
    const dto = await this.httpClient.post<PromotionRuleDto>(
      API_ENDPOINTS.PROMOTION_RULES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create promotion rule response missing id");
    return toPromotionRule(dto as PromotionRuleDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
  ): Promise<PromotionRule> {
    const dto = await this.httpClient.patch<PromotionRuleDto>(
      API_ENDPOINTS.PROMOTION_RULES.UPDATE(id),
      data
    );
    return toPromotionRule({ ...dto, id: dto?.id ?? id } as PromotionRuleDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.PROMOTION_RULES.DELETE(id));
  }
}

