export interface ReceiptHeader {
  businessName: string;
  legalName?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface ReceiptOrderInfo {
  receiptNumber: string;
  orderNumber: string;
  dateTime?: string;
  salesChannel?: string;
  locationName?: string;
}

export interface ReceiptCustomer {
  name?: string;
  phone?: string;
  email?: string;
  loyaltyTier?: string;
  pointsEarned?: number;
}

export interface ReceiptLineItem {
  productName: string;
  variantSku?: string;
  barcode?: string;
  variantOptions?: Record<string, string>;
  quantity: number;
  unitPrice: number;
  lineDiscount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface ReceiptTaxSummary {
  taxName: string;
  ratePercentage: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface ReceiptTotals {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
}

export interface ReceiptPayment {
  methodName: string;
  amount: number;
  transactionReference?: string | null;
  paymentDate?: string | null;
}

export interface ReceiptPaymentSummary {
  payments: ReceiptPayment[];
  totalPaid: number;
  changeDue: number;
}

export interface ReceiptFooter {
  message?: string;
  returnPolicy?: string;
}

export interface Receipt {
  header: ReceiptHeader;
  orderInfo: ReceiptOrderInfo;
  customer?: ReceiptCustomer;
  lineItems: ReceiptLineItem[];
  taxSummary: ReceiptTaxSummary[];
  totals: ReceiptTotals;
  paymentSummary: ReceiptPaymentSummary;
  footer?: ReceiptFooter;
}

