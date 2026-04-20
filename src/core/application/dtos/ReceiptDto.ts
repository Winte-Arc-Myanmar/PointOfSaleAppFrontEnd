/**
 * DTOs for receipts API response.
 * Application layer - matches backend contract (decimals may arrive as strings).
 */

export interface ReceiptHeaderDto {
  businessName?: string;
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

export interface ReceiptOrderInfoDto {
  receiptNumber?: string;
  orderNumber?: string;
  dateTime?: string;
  salesChannel?: string;
  locationName?: string;
}

export interface ReceiptCustomerDto {
  name?: string;
  phone?: string;
  email?: string;
  loyaltyTier?: string;
  pointsEarned?: unknown;
}

export interface ReceiptLineItemDto {
  productName?: string;
  variantSku?: string;
  barcode?: string;
  variantOptions?: Record<string, string>;
  quantity?: unknown;
  unitPrice?: unknown;
  lineDiscount?: unknown;
  taxAmount?: unknown;
  lineTotal?: unknown;
}

export interface ReceiptTaxSummaryDto {
  taxName?: string;
  ratePercentage?: unknown;
  taxableAmount?: unknown;
  taxAmount?: unknown;
}

export interface ReceiptTotalsDto {
  subtotal?: unknown;
  totalDiscount?: unknown;
  totalTax?: unknown;
  grandTotal?: unknown;
}

export interface ReceiptPaymentDto {
  methodName?: string;
  amount?: unknown;
  transactionReference?: string | null;
  paymentDate?: string | null;
}

export interface ReceiptPaymentSummaryDto {
  payments?: ReceiptPaymentDto[];
  totalPaid?: unknown;
  changeDue?: unknown;
}

export interface ReceiptFooterDto {
  message?: string;
  returnPolicy?: string;
}

export interface ReceiptDto {
  header?: ReceiptHeaderDto;
  orderInfo?: ReceiptOrderInfoDto;
  customer?: ReceiptCustomerDto;
  lineItems?: ReceiptLineItemDto[];
  taxSummary?: ReceiptTaxSummaryDto[];
  totals?: ReceiptTotalsDto;
  paymentSummary?: ReceiptPaymentSummaryDto;
  footer?: ReceiptFooterDto;
}

