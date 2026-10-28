/** A fee the cashier adds to a bill, such as a plastic container or delivery. */
export interface ExtraFee {
  id: string;
  name: string;
  /** What the till fills in; the cashier may change it on a bill. */
  amount: number;
  variantId: string;
  isActive: boolean;
  /** The built-in "Other": the cashier types its name and amount. */
  isOther: boolean;
}

export interface ExtraFeeInput {
  name: string;
  amount: number;
  isActive?: boolean;
}
