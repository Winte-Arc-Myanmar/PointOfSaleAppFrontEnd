export interface GrnLineDto {
  id?: string;
  grnId?: string;
  poLineId: string;
  productId: string;
  receivedQuantity: string;
  acceptedQuantity: string;
  rejectedQuantity: string;
  inventoryLedgerPosted: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}
