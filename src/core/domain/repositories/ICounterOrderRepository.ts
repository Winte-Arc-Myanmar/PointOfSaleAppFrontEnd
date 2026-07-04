import type { CounterOrder } from "../entities/CounterOrder";

export interface ICounterOrderRepository {
  getById(id: string): Promise<CounterOrder | null>;
  pickup(id: string): Promise<CounterOrder>;
}
