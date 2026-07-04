import type { CounterOrderDto } from "@/core/application/dtos/CounterOrderDto";
import { toCounterOrder } from "@/core/application/mappers/CounterOrderMapper";
import type { CounterOrder } from "@/core/domain/entities/CounterOrder";
import type { ICounterOrderRepository } from "@/core/domain/repositories/ICounterOrderRepository";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";

export class ApiCounterOrderRepository implements ICounterOrderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getById(id: string): Promise<CounterOrder | null> {
    try {
      const dto = await this.httpClient.get<CounterOrderDto>(API_ENDPOINTS.COUNTER_ORDERS.BY_ID(id));
      if (!dto?.id) return null;
      return toCounterOrder(dto as CounterOrderDto & { id: string });
    } catch {
      return null;
    }
  }

  async pickup(id: string): Promise<CounterOrder> {
    const dto = await this.httpClient.post<CounterOrderDto>(API_ENDPOINTS.COUNTER_ORDERS.PICKUP(id));
    if (!dto?.id) throw new Error("Pickup counter order response missing id");
    return toCounterOrder({ ...dto, id: dto.id ?? id } as CounterOrderDto & { id: string });
  }
}
