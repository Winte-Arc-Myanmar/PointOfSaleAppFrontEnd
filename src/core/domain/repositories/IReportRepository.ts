import type {
  DailySalesSummary,
  ItemSalesReport,
  LoyaltyPointsReport,
  MemberCardReport,
  OtherIncomeReport,
  SalesByCategory,
  SalesByHour,
  SalesByItem,
  SalesSummaryReport,
  ServerPerformance,
  ZReport,
} from "@/core/domain/entities/Report";

export interface GetDailyReportParams {
  /** Omit to include every outlet the user can see. */
  locationId?: string;
  date: string;
}

export interface GetDateRangeReportParams {
  /** Omit to include every outlet the user can see. */
  locationId?: string;
  fromDate: string;
  toDate: string;
  limit?: number;
}

export interface GetBusinessDateReportParams {
  /** First business date, YYYY-MM-DD, in the property’s timezone. */
  from: string;
  /** Last business date, included. Defaults to from on the server. */
  to?: string;
  /** Omit to include every outlet the user can see. */
  locationId?: string;
}

export const ITEM_SALES_SORT_FIELDS = [
  "netSales",
  "grossSales",
  "quantitySold",
  "refundAmount",
  "productName",
  "categoryName",
] as const;

export type ItemSalesSortBy = (typeof ITEM_SALES_SORT_FIELDS)[number];

export interface GetItemSalesParams extends GetBusinessDateReportParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: ItemSalesSortBy;
  sortOrder?: "asc" | "desc";
}

export interface GetLoyaltyPointsParams extends GetBusinessDateReportParams {
  /** How many top members to list. Defaults to 10 on the server. */
  top?: number;
}

export interface IReportRepository {
  getDailySales(params: GetDailyReportParams): Promise<DailySalesSummary>;
  getSalesByCategory(params: GetDateRangeReportParams): Promise<SalesByCategory[]>;
  getSalesByItem(params: GetDateRangeReportParams): Promise<SalesByItem[]>;
  getSalesByHour(params: GetDailyReportParams): Promise<SalesByHour[]>;
  getServerPerformance(params: GetDateRangeReportParams): Promise<ServerPerformance[]>;
  getZReport(params: GetDailyReportParams): Promise<ZReport>;
  getSalesSummary(params: GetBusinessDateReportParams): Promise<SalesSummaryReport>;
  getItemSales(params: GetItemSalesParams): Promise<ItemSalesReport>;
  getOtherIncomeExpenses(params: GetBusinessDateReportParams): Promise<OtherIncomeReport>;
  getMemberCards(params: GetBusinessDateReportParams): Promise<MemberCardReport>;
  getLoyaltyPoints(params: GetLoyaltyPointsParams): Promise<LoyaltyPointsReport>;
}
