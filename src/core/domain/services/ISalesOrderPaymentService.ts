import type { SalesOrderPayment } from "../entities/SalesOrderPayment";
import type { SalesOrderPaymentDto } from "@/core/application/dtos/SalesOrderPaymentDto";
import type { GetSalesOrderPaymentsParams } from "../repositories/ISalesOrderPaymentRepository";

export interface ISalesOrderPaymentService {
  getAll(
    salesOrderId: string,
    params?: GetSalesOrderPaymentsParams
  ): Promise<SalesOrderPayment[]>;
  getById(
    salesOrderId: string,
    id: string
  ): Promise<SalesOrderPayment | null>;
  create(
    salesOrderId: string,
    data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
  ): Promise<SalesOrderPayment>;
  update(
    salesOrderId: string,
    id: string,
    data: Omit<SalesOrderPaymentDto, "id" | "salesOrderId" | "paymentDate" | "updatedAt">
  ): Promise<SalesOrderPayment>;
  delete(salesOrderId: string, id: string): Promise<void>;
}

