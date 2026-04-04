export type LoyaltyLedgerPlacement = "customer-profile" | "loyalty-menu";

export function getLoyaltyLedgerListPath(
  customerId: string,
  placement: LoyaltyLedgerPlacement
) {
  return placement === "customer-profile"
    ? `/customers/${customerId}/loyalty-ledger`
    : `/loyalty-ledger/${customerId}`;
}
