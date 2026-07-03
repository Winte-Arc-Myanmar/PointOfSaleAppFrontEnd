import type { CounterOrder } from "@/core/domain/entities/CounterOrder";
import type { ICounterOrderRepository } from "@/core/domain/repositories/ICounterOrderRepository";
import type { ICounterOrderService } from "@/core/domain/services/ICounterOrderService";

export class CounterOrderService implements ICounterOrderService {
  constructor(private readonly repository: ICounterOrderRepository) {}

  getById(id: string): Promise<CounterOrder | null> {
    return this.repository.getById(id);
  }

  pickup(id: string): Promise<CounterOrder> {
    return this.repository.pickup(id);
  }
}
