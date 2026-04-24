import type {
  IChartOfAccountRepository,
  GetChartOfAccountsParams,
} from "@/core/domain/repositories/IChartOfAccountRepository";
import type { ChartOfAccount } from "@/core/domain/entities/ChartOfAccount";
import type { ChartOfAccountDto } from "@/core/application/dtos/ChartOfAccountDto";
import { toChartOfAccount } from "@/core/application/mappers/ChartOfAccountMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiChartOfAccountRepository implements IChartOfAccountRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetChartOfAccountsParams): Promise<ChartOfAccount[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    };

    const res = await this.httpClient.get<
      ChartOfAccountDto[] | { data?: ChartOfAccountDto[] }
    >(API_ENDPOINTS.CHART_OF_ACCOUNTS.LIST, { params: query });

    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is ChartOfAccountDto & { id: string } => !!d?.id)
      .map((d) => toChartOfAccount(d as ChartOfAccountDto & { id: string }));
  }

  async getById(id: string): Promise<ChartOfAccount | null> {
    try {
      const dto = await this.httpClient.get<ChartOfAccountDto>(
        API_ENDPOINTS.CHART_OF_ACCOUNTS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toChartOfAccount(dto as ChartOfAccountDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ChartOfAccount> {
    const dto = await this.httpClient.post<ChartOfAccountDto>(
      API_ENDPOINTS.CHART_OF_ACCOUNTS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create chart of account response missing id");
    return toChartOfAccount(dto as ChartOfAccountDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<ChartOfAccountDto, "id" | "createdAt" | "updatedAt">
  ): Promise<ChartOfAccount> {
    const dto = await this.httpClient.patch<ChartOfAccountDto>(
      API_ENDPOINTS.CHART_OF_ACCOUNTS.UPDATE(id),
      data
    );
    return toChartOfAccount(
      { ...dto, id: dto?.id ?? id } as ChartOfAccountDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.CHART_OF_ACCOUNTS.DELETE(id));
  }
}

