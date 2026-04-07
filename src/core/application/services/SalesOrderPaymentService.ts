import type { ISalesOrderPaymentService } from "@/core/domain/services/ISalesOrderPaymentService";
import type { ISalesOrderPaymentRepository } from "@/core/domain/repositories/ISalesOrderPaymentRepository";
import type { SalesOrderPayment } from "@/core/domain/entities/SalesOrderPayment";
import type { GetSalesOrderPaymentsParams } from "@/core/domain/repositories/ISalesOrderPaymentRepository";
import type { SalesOrderPaymentDto } from "../dtos/SalesOrderPaymentDto";

export class SalesOrderPaymentService implements ISalesOrderPaymentService {
  constructor(
    private readonly salesOrderPaymentRepository: ISalesOrderPaymentRepository
  ) {}

  getAll(
    salesOrderId: string,
    params?: GetSalesOrderPaymentsParams
  ): Promise<SalesOrderPayment[]> {
    return this.salesOrderPaymentRepository.getAll(salesOrderId, params);
  }

  getById(
    salesOrderId: string,
    id: string
  ): Promise<SalesOrderPayment | null> {
    return this.salesOrderPaymentRepository.getById(salesOrderId, id);
  }

  create(
    salesOrderId: string,
    data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
  ): Promise<SalesOrderPayment> {
    return this.salesOrderPaymentRepository.create(salesOrderId, data);
  }

  update(
    salesOrderId: string,
    id: string,
    data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
  ): Promise<SalesOrderPayment> {
    return this.salesOrderPaymentRepository.update(salesOrderId, id, data);
  }

  delete(salesOrderId: string, id: string): Promise<void> {
    return this.salesOrderPaymentRepository.delete(salesOrderId, id);
  }
}

