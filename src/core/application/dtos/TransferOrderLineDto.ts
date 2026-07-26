export interface TransferOrderLineDto {
  id?: string;
  transferOrderId?: string;
  productId: string;
  requestedQuantity: string;
  shippedQuantity: string;
  receivedQuantity: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
