export type CustomerInteractionsPlacement =
  | "customer-profile"
  | "interactions-menu";

export function getCustomerInteractionsListPath(
  customerId: string,
  placement: CustomerInteractionsPlacement
) {
  return placement === "customer-profile"
    ? `/customers/${customerId}/interactions`
    : `/customer-interactions/${customerId}`;
}
