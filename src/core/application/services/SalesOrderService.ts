import type { ISalesOrderService } from "@/core/domain/services/ISalesOrderService";
import type { ISalesOrderRepository } from "@/core/domain/repositories/ISalesOrderRepository";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import type { GetSalesOrdersParams } from "@/core/domain/repositories/ISalesOrderRepository";
import type { SalesOrderDto } from "../dtos/SalesOrderDto";

export class SalesOrderService implements ISalesOrderService {
  constructor(private readonly salesOrderRepository: ISalesOrderRepository) {}

  getAll(params?: GetSalesOrdersParams): Promise<SalesOrder[]> {
    return this.salesOrderRepository.getAll(params);
  }

  getById(id: string): Promise<SalesOrder | null> {
    return this.salesOrderRepository.getById(id);
  }

  create(
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder> {
    return this.salesOrderRepository.create(data);
  }

  update(
    id: string,
    data: Omit<SalesOrderDto, "id" | "createdAt" | "updatedAt">
  ): Promise<SalesOrder> {
    return this.salesOrderRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.salesOrderRepository.delete(id);
  }
}

