import type {
  DailySalesSummary,
  SalesByCategory,
  SalesByHour,
  SalesByItem,
  ServerPerformance,
  ZReport,
} from "@/core/domain/entities/Report";
import type {
  GetDailyReportParams,
  GetDateRangeReportParams,
} from "@/core/domain/repositories/IReportRepository";

export interface IReportService {
  getDailySales(params: GetDailyReportParams): Promise<DailySalesSummary>;
  getSalesByCategory(params: GetDateRangeReportParams): Promise<SalesByCategory[]>;
  getSalesByItem(params: GetDateRangeReportParams): Promise<SalesByItem[]>;
  getSalesByHour(params: GetDailyReportParams): Promise<SalesByHour[]>;
  getServerPerformance(params: GetDateRangeReportParams): Promise<ServerPerformance[]>;
  getZReport(params: GetDailyReportParams): Promise<ZReport>;
}
