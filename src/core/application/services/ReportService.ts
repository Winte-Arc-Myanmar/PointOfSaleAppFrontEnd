import type {
  GetBusinessDateReportParams,
  GetDailyReportParams,
  GetDateRangeReportParams,
  GetItemSalesParams,
  GetLoyaltyPointsParams,
  IReportRepository,
} from "@/core/domain/repositories/IReportRepository";
import type { IReportService } from "@/core/domain/services/IReportService";

export class ReportService implements IReportService {
  constructor(private readonly reportRepository: IReportRepository) {}

  getDailySales(params: GetDailyReportParams) {
    return this.reportRepository.getDailySales(params);
  }

  getSalesByCategory(params: GetDateRangeReportParams) {
    return this.reportRepository.getSalesByCategory(params);
  }

  getSalesByItem(params: GetDateRangeReportParams) {
    return this.reportRepository.getSalesByItem(params);
  }

  getSalesByHour(params: GetDailyReportParams) {
    return this.reportRepository.getSalesByHour(params);
  }

  getServerPerformance(params: GetDateRangeReportParams) {
    return this.reportRepository.getServerPerformance(params);
  }

  getZReport(params: GetDailyReportParams) {
    return this.reportRepository.getZReport(params);
  }

  getSalesSummary(params: GetBusinessDateReportParams) {
    return this.reportRepository.getSalesSummary(params);
  }

  getItemSales(params: GetItemSalesParams) {
    return this.reportRepository.getItemSales(params);
  }

  getOtherIncomeExpenses(params: GetBusinessDateReportParams) {
    return this.reportRepository.getOtherIncomeExpenses(params);
  }

  getMemberCards(params: GetBusinessDateReportParams) {
    return this.reportRepository.getMemberCards(params);
  }

  getLoyaltyPoints(params: GetLoyaltyPointsParams) {
    return this.reportRepository.getLoyaltyPoints(params);
  }
}
