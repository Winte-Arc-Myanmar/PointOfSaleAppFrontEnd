import type { PaymentMethodKind } from "@/core/domain/entities/PaymentMethod";

export const PAYMENT_METHOD_KIND_LABELS: Record<PaymentMethodKind, { label: string; hint: string }> = {
  CASH: { label: "Cash", hint: "Counted in the cash drawer when a shift closes." },
  CARD: { label: "Card", hint: "Debit or credit card on a terminal." },
  MOBILE_WALLET: { label: "Mobile wallet", hint: "KBZPay, WavePay, AYA Pay… Asks for the transaction ID." },
  BANK_TRANSFER: { label: "Bank transfer", hint: "Money sent to your bank account." },
  CUSTOMER_CREDIT: { label: "Customer credit", hint: "Pay later on the customer's account, within their credit limit." },
  GUEST_CARD: { label: "Guest card", hint: "Paid from a guest card's wallet." },
  VOUCHER: { label: "Voucher", hint: "Gift voucher or coupon." },
  OTHER: { label: "Other", hint: "Recorded only; no special handling." },
};
