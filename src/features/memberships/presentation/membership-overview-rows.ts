import type { MembershipMember } from "@/core/domain/entities/MembershipMember";
import { formatDate, safeText } from "@/presentation/components/detail";

export function getMembershipOverviewRows(
  member: MembershipMember,
  formatPrice: (value: number) => string,
) {
  return [
    { label: "Membership ID", value: safeText(member.id), mono: true },
    { label: "Wallet number", value: safeText(member.walletNumber || "-"), mono: true },
    { label: "Customer", value: safeText(member.customerName) },
    { label: "Phone", value: safeText(member.phone || "—") },
    { label: "Email", value: safeText(member.email || "—") },
    { label: "Tier", value: safeText(member.tier) },
    { label: "Tier snapshot", value: safeText(member.cardTemplateName) },
    { label: "Guest ID number", value: safeText(member.guestIdNumber || "-") },
    { label: "Wallet balance", value: formatPrice(member.walletBalance) },
    {
      label: "Purchased balance",
      value: formatPrice(member.purchasedBalance ?? member.walletBalance),
    },
    { label: "Granted balance", value: formatPrice(member.grantedBalance ?? 0) },
    { label: "Card number", value: safeText(member.cardNumber || "Unbound"), mono: true },
    { label: "Card label", value: safeText(member.cardLabel || "-") },
    { label: "Room number", value: safeText(member.cardRoomNumber || "-") },
    { label: "Card status", value: safeText(member.cardBindStatus) },
    { label: "Membership status", value: safeText(member.status) },
    { label: "Discount snapshot", value: safeText(member.discountBpsSnapshot ?? 0) },
    {
      label: "Preload amount snapshot",
      value: formatPrice(member.preloadAmountSnapshot ?? 0),
    },
    { label: "Preload funding snapshot", value: safeText(member.preloadFundingSnapshot || "-") },
    { label: "Registered at", value: formatDate(member.registeredAt) },
    { label: "Opened at", value: formatDate(member.openedAt) },
    { label: "Expires at", value: formatDate(member.expiresAt) },
    { label: "Issued location ID", value: safeText(member.issuedAtLocationId || "-"), mono: true },
    { label: "Issued by user ID", value: safeText(member.issuedByUserId || "-"), mono: true },
    { label: "Closed by user ID", value: safeText(member.closedByUserId || "-"), mono: true },
    ...(member.closedAt
      ? [{ label: "Closed at", value: formatDate(member.closedAt) }]
      : []),
  ];
}
