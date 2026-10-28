import type { ExtraFee, ExtraFeeInput } from "@/core/domain/entities/ExtraFee";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

type ExtraFeeDto = Omit<ExtraFee, "amount"> & { amount: string | number };

const toExtraFee = (dto: ExtraFeeDto): ExtraFee => ({
  id: String(dto.id),
  name: dto.name ?? "",
  amount: Number(dto.amount) || 0,
  variantId: String(dto.variantId ?? ""),
  isActive: dto.isActive !== false,
  isOther: dto.isOther === true,
});

export class ApiExtraFeeRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<ExtraFee[]> {
    const rows = await this.httpClient.get<ExtraFeeDto[]>(API_ENDPOINTS.EXTRA_FEES.LIST);
    return (Array.isArray(rows) ? rows : []).map(toExtraFee);
  }

  async create(data: ExtraFeeInput): Promise<ExtraFee> {
    return toExtraFee(await this.httpClient.post<ExtraFeeDto>(API_ENDPOINTS.EXTRA_FEES.LIST, data));
  }

  async update(id: string, data: Partial<ExtraFeeInput>): Promise<ExtraFee> {
    return toExtraFee(await this.httpClient.patch<ExtraFeeDto>(API_ENDPOINTS.EXTRA_FEES.BY_ID(id), data));
  }

  async remove(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.EXTRA_FEES.BY_ID(id));
  }
}
