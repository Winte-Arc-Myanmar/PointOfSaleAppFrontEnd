import type {
  DailySalesSummaryDto,
  SalesByCategoryDto,
  SalesByHourDto,
  SalesByItemDto,
  ServerPerformanceDto,
  ZReportDto,
} from "@/core/application/dtos/ReportDto";
import {
  toDailySalesSummary,
  toSalesByCategoryList,
  toSalesByHourList,
  toSalesByItemList,
  toServerPerformanceList,
  toZReport,
} from "@/core/application/mappers/ReportMapper";
import type {
  GetDailyReportParams,
  GetDateRangeReportParams,
  IReportRepository,
} from "@/core/domain/repositories/IReportRepository";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";

export class ApiReportRepository implements IReportRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getDailySales(params: GetDailyReportParams) {
    const dto = await this.httpClient.get<DailySalesSummaryDto>(
      API_ENDPOINTS.REPORTS.DAILY_SALES,
      {
        params: {
          locationId: params.locationId,
          date: params.date,
        },
      },
    );
    return toDailySalesSummary(dto);
  }

  async getSalesByCategory(params: GetDateRangeReportParams) {
    const dtos = await this.httpClient.get<SalesByCategoryDto[]>(
      API_ENDPOINTS.REPORTS.SALES_BY_CATEGORY,
      {
        params: {
          locationId: params.locationId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          ...(params.limit != null ? { limit: params.limit } : {}),
        },
      },
    );
    return toSalesByCategoryList(dtos);
  }

  async getSalesByItem(params: GetDateRangeReportParams) {
    const dtos = await this.httpClient.get<SalesByItemDto[]>(
      API_ENDPOINTS.REPORTS.SALES_BY_ITEM,
      {
        params: {
          locationId: params.locationId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          ...(params.limit != null ? { limit: params.limit } : {}),
        },
      },
    );
    return toSalesByItemList(dtos);
  }

  async getSalesByHour(params: GetDailyReportParams) {
    const dtos = await this.httpClient.get<SalesByHourDto[]>(
      API_ENDPOINTS.REPORTS.SALES_BY_HOUR,
      {
        params: {
          locationId: params.locationId,
          date: params.date,
        },
      },
    );
    return toSalesByHourList(dtos);
  }

  async getServerPerformance(params: GetDateRangeReportParams) {
    const dtos = await this.httpClient.get<ServerPerformanceDto[]>(
      API_ENDPOINTS.REPORTS.SERVER_PERFORMANCE,
      {
        params: {
          locationId: params.locationId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          ...(params.limit != null ? { limit: params.limit } : {}),
        },
      },
    );
    return toServerPerformanceList(dtos);
  }

  async getZReport(params: GetDailyReportParams) {
    const dto = await this.httpClient.get<ZReportDto>(API_ENDPOINTS.REPORTS.Z_REPORT, {
      params: {
        locationId: params.locationId,
        date: params.date,
      },
    });
    return toZReport(dto);
  }
}
