export interface OrderEditPerson {
  id: string;
  fullName: string | null;
}

export interface OrderSnapshotLine {
  id: string;
  variantId: string;
  productName: string | null;
  variantName: string | null;
  quantity: string;
  unitPrice: string;
  lineDiscount: string;
  taxAmount: string;
  status: string;
  hostessId: string | null;
}

export interface OrderSnapshotPayment {
  id: string;
  paymentMethodId: string;
  method: string;
  amount: string;
  posSessionId: string | null;
}

/** The order as it stood on one side of an edit. */
export interface OrderSnapshot {
  subtotal: string;
  totalDiscount: string;
  totalTax: string;
  serviceCharge: string;
  tipAmount: string;
  grandTotal: string;
  customerId: string | null;
  lines: OrderSnapshotLine[];
  payments: OrderSnapshotPayment[];
}

export interface SalesOrderEdit {
  id: string;
  reason: string;
  editedBy: OrderEditPerson;
  approvedBy: OrderEditPerson;
  previousTotal: string;
  newTotal: string;
  before: OrderSnapshot;
  after: OrderSnapshot;
  /** Customer and hostess names by id. */
  names: Record<string, string>;
  createdAt: string;
}

export interface SalesOrderEditListItem {
  id: string;
  salesOrder: { id: string; orderNumber: string };
  reason: string;
  editedBy: OrderEditPerson;
  approvedBy: OrderEditPerson;
  previousTotal: string;
  newTotal: string;
  createdAt: string;
}
