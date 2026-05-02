import type {
  IPaymentMethodRepository,
  GetPaymentMethodsParams,
} from "@/core/domain/repositories/IPaymentMethodRepository";
import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";
import type { PaymentMethodDto } from "@/core/application/dtos/PaymentMethodDto";
import { toPaymentMethod } from "@/core/application/mappers/PaymentMethodMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiPaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetPaymentMethodsParams): Promise<PaymentMethod[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    };

    const res = await this.httpClient.get<
      PaymentMethodDto[] | { data?: PaymentMethodDto[] }
    >(API_ENDPOINTS.PAYMENT_METHODS.LIST, { params: query });

    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is PaymentMethodDto & { id: string } => !!d?.id)
      .map((d) => toPaymentMethod(d as PaymentMethodDto & { id: string }));
  }

  async getById(id: string): Promise<PaymentMethod | null> {
    try {
      const dto = await this.httpClient.get<PaymentMethodDto>(
        API_ENDPOINTS.PAYMENT_METHODS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toPaymentMethod(dto as PaymentMethodDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethod> {
    const dto = await this.httpClient.post<PaymentMethodDto>(
      API_ENDPOINTS.PAYMENT_METHODS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create payment method response missing id");
    return toPaymentMethod(dto as PaymentMethodDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentMethod> {
    const dto = await this.httpClient.patch<PaymentMethodDto>(
      API_ENDPOINTS.PAYMENT_METHODS.UPDATE(id),
      data
    );
    return toPaymentMethod(
      { ...dto, id: dto?.id ?? id } as PaymentMethodDto & { id: string }
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.PAYMENT_METHODS.DELETE(id));
  }
}



