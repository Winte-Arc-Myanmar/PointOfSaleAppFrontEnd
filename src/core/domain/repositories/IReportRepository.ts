import type {
  DailySalesSummary,
  SalesByCategory,
  SalesByHour,
  SalesByItem,
  ServerPerformance,
  ZReport,
} from "@/core/domain/entities/Report";

export interface GetDailyReportParams {
  locationId: string;
  date: string;
}

export interface GetDateRangeReportParams {
  locationId: string;
  fromDate: string;
  toDate: string;
  limit?: number;
}

export interface IReportRepository {
  getDailySales(params: GetDailyReportParams): Promise<DailySalesSummary>;
  getSalesByCategory(params: GetDateRangeReportParams): Promise<SalesByCategory[]>;
  getSalesByItem(params: GetDateRangeReportParams): Promise<SalesByItem[]>;
  getSalesByHour(params: GetDailyReportParams): Promise<SalesByHour[]>;
  getServerPerformance(params: GetDateRangeReportParams): Promise<ServerPerformance[]>;
  getZReport(params: GetDailyReportParams): Promise<ZReport>;
}
