export type PosType = "SPA" | "KTV" | "BAR";

export interface NameAmount {
  name: string;
  amount: string;
}

export interface PosBill {
  orderId: string;
  orderNumber: string;
  businessDate: string;
  soldAt: string;
  place: string | null;
  guestName: string | null;
  items: { name: string; quantity: string; netSales: string }[];
  compedItems: { name: string; quantity: string; value: string }[];
  grossSales: string;
  discounts: string;
  netSales: string;
  tax: string;
  grandTotal: string;
  payments: NameAmount[];
}

export interface PosBillsReport {
  from: string;
  to: string;
  posType: PosType;
  totals: {
    billCount: number;
    grossSales: string;
    discounts: string;
    netSales: string;
    tax: string;
    grandTotal: string;
  };
  bills: PosBill[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface SalesTally {
  orderCount: number;
  quantity: string;
  grossSales: string;
  discounts: string;
  netSales: string;
  shareOfNetSales: string;
  compedQuantity: string;
  compedValue: string;
}

export interface BarSubCategory extends SalesTally {
  categoryId: string | null;
  categoryName: string;
  refundAmount: string;
}

export interface BarCategory extends BarSubCategory {
  subCategories: BarSubCategory[];
}

export interface BarCategoryReport {
  from: string;
  to: string;
  totals: {
    orderCount: number;
    quantity: string;
    grossSales: string;
    discounts: string;
    netSales: string;
    refundAmount: string;
    compedValue: string;
  };
  categories: BarCategory[];
}

export interface SpaMenuRow extends SalesTally {
  variantId: string;
  name: string;
  durationMinutes: number | null;
  includes: string[];
}

export interface SpaMenuSection {
  totals: {
    quantity: string;
    grossSales: string;
    discounts: string;
    netSales: string;
    shareOfNetSales: string;
    compedValue: string;
  };
  rows: SpaMenuRow[];
}

export interface SpaMenuReport {
  from: string;
  to: string;
  totals: { orderCount: number; netSales: string; grandTotal: string };
  spaMenu: SpaMenuSection;
  roomMenuPackages: SpaMenuSection;
  roomServices: SpaMenuSection;
  roomTime: SpaMenuSection;
}

export interface KtvSessionRow {
  sessionId: string | null;
  orderId: string;
  orderNumber: string;
  businessDate: string;
  roomNumber: string | null;
  roomName: string | null;
  guestName: string | null;
  guestCount: number | null;
  openedAt: string | null;
  closedAt: string | null;
  minutesUsed: number | null;
  hoursSold: string;
  freeHours: string;
  roomSales: string;
  fnbSales: string;
  discounts: string;
  compedValue: string;
  netSales: string;
  grandTotal: string;
  payments: NameAmount[];
}

export interface KtvRoomSummary {
  roomId: string;
  roomNumber: string;
  roomName: string | null;
  sessionCount: number;
  hoursSold: string;
  freeHours: string;
  roomSales: string;
  fnbSales: string;
  grandTotal: string;
}

export interface KtvSessionReport {
  from: string;
  to: string;
  totals: {
    sessionCount: number;
    hoursSold: string;
    freeHours: string;
    roomSales: string;
    fnbSales: string;
    discounts: string;
    compedValue: string;
    netSales: string;
    grandTotal: string;
  };
  byRoom: KtvRoomSummary[];
  sessions: KtvSessionRow[];
}
