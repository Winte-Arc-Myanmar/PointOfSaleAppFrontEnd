import {
  Banknote,
  CircleEllipsis,
  CreditCard,
  HandCoins,
  Landmark,
  Smartphone,
  Ticket,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { PaymentMethodKind } from "@/core/domain/entities/PaymentMethod";

export const PAYMENT_METHOD_KIND_LABELS: Record<
  PaymentMethodKind,
  { label: string; hint: string; icon: LucideIcon }
> = {
  CASH: { label: "Cash", hint: "Notes and coins. Counted in the cash drawer when a shift closes.", icon: Banknote },
  CARD: { label: "Card", hint: "Debit or credit card on a card terminal.", icon: CreditCard },
  MOBILE_WALLET: { label: "Mobile wallet", hint: "KBZPay, WavePay, AYA Pay… Staff enter the transaction ID.", icon: Smartphone },
  BANK_TRANSFER: { label: "Bank transfer", hint: "Money sent straight to your bank account.", icon: Landmark },
  CUSTOMER_CREDIT: { label: "Customer credit", hint: "Pay later on the customer's account, within their credit limit.", icon: HandCoins },
  GUEST_CARD: { label: "Guest card", hint: "Paid from a guest card's wallet balance.", icon: WalletCards },
  VOUCHER: { label: "Voucher", hint: "Gift voucher or coupon.", icon: Ticket },
  OTHER: { label: "Other", hint: "Recorded only, with no special handling.", icon: CircleEllipsis },
};

export const MAIN_PAYMENT_METHOD_KINDS: PaymentMethodKind[] = [
  "CASH",
  "CARD",
  "MOBILE_WALLET",
  "BANK_TRANSFER",
  "OTHER",
];

export function paymentMethodKindLabel(kind: string | undefined) {
  return PAYMENT_METHOD_KIND_LABELS[kind as PaymentMethodKind] ?? PAYMENT_METHOD_KIND_LABELS.OTHER;
}
