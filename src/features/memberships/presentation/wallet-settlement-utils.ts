import type {
  MembershipMember,
  MembershipSettlementQuote,
} from "@/core/domain/entities/MembershipMember";

export function isWalletSettling(status: string | null | undefined): boolean {
  return String(status ?? "")
    .toUpperCase()
    .includes("SETTL");
}

export function hasSettlementBlockers(
  quote: MembershipSettlementQuote | null | undefined,
): boolean {
  return (quote?.blockers?.length ?? 0) > 0;
}

export function getPurchasedBalance(member: MembershipMember): number {
  return member.purchasedBalance ?? member.walletBalance ?? 0;
}

export function canVoidWallet(member: MembershipMember): boolean {
  if (
    member.status === "CLOSED" ||
    member.status === "VOIDED" ||
    isWalletSettling(member.status)
  ) {
    return false;
  }
  const sequenceNo = member.sequenceNo;
  if (sequenceNo != null && sequenceNo > 1) return false;
  return true;
}

export function needsRefundAtSettlement(
  quote: MembershipSettlementQuote | null | undefined,
): boolean {
  return (quote?.refundable ?? 0) > 0;
}

export function needsCollectAtSettlement(
  quote: MembershipSettlementQuote | null | undefined,
): boolean {
  return (quote?.collectable ?? 0) > 0;
}

export function formatSettlementAction(action: string | null | undefined): string {
  switch (String(action ?? "").toUpperCase()) {
    case "REFUND_DUE":
      return "Refund due to guest";
    case "COLLECT_DUE":
      return "Collect payment from guest";
    case "ZERO_BALANCE":
    case "NOTHING_DUE":
      return "No money movement — close wallet";
    default:
      return action || "—";
  }
}

export function settlementStepState({
  isClosed,
  walletStatus,
  quote,
}: {
  isClosed: boolean;
  walletStatus: string;
  quote: MembershipSettlementQuote | null | undefined;
}): {
  step: 1 | 2 | 3;
  isSettling: boolean;
  hasBlockers: boolean;
  canBegin: boolean;
  canCancel: boolean;
  canSettle: boolean;
} {
  const isSettling = isWalletSettling(walletStatus);
  const hasBlockers = hasSettlementBlockers(quote);
  const canBegin = !isClosed && !isSettling;
  const canCancel = !isClosed && isSettling;
  const canSettle = !isClosed && isSettling && !hasBlockers;

  let step: 1 | 2 | 3 = 1;
  if (isSettling) step = 3;
  else if (quote) step = 2;

  return {
    step,
    isSettling,
    hasBlockers,
    canBegin,
    canCancel,
    canSettle,
  };
}
