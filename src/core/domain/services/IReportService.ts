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
import type {
  GetBusinessDateReportParams,
  GetDailyReportParams,
  GetDateRangeReportParams,
  GetItemSalesParams,
  GetLoyaltyPointsParams,
} from "@/core/domain/repositories/IReportRepository";

export interface IReportService {
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
