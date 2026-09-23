import type {
  DailySalesSummaryDto,
  ItemSalesDto,
  LoyaltyPointsDto,
  MemberCardDto,
  OtherIncomeDto,
  SalesByCategoryDto,
  SalesByHourDto,
  SalesByItemDto,
  SalesSummaryDto,
  ServerPerformanceDto,
  ZReportDto,
} from "@/core/application/dtos/ReportDto";
import {
  toDailySalesSummary,
  toItemSales,
  toLoyaltyPoints,
  toMemberCards,
  toOtherIncome,
  toSalesByCategoryList,
  toSalesByHourList,
  toSalesByItemList,
  toSalesSummary,
  toServerPerformanceList,
  toZReport,
} from "@/core/application/mappers/ReportMapper";
import type {
  GetBusinessDateReportParams,
  GetDailyReportParams,
  GetDateRangeReportParams,
  GetItemSalesParams,
  GetLoyaltyPointsParams,
  IReportRepository,
} from "@/core/domain/repositories/IReportRepository";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";

function definedParams(
  input: Record<string, string | number | undefined>,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") continue;
    params[key] = value;
  }
  return params;
}

export class ApiReportRepository implements IReportRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getDailySales(params: GetDailyReportParams) {
    const dto = await this.httpClient.get<DailySalesSummaryDto>(
      API_ENDPOINTS.REPORTS.DAILY_SALES,
      { params: definedParams({ locationId: params.locationId, date: params.date }) },
    );
    return toDailySalesSummary(dto);
  }

  async getSalesByCategory(params: GetDateRangeReportParams) {
    const dtos = await this.httpClient.get<SalesByCategoryDto[]>(
      API_ENDPOINTS.REPORTS.SALES_BY_CATEGORY,
      {
        params: definedParams({
          locationId: params.locationId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          limit: params.limit,
        }),
      },
    );
    return toSalesByCategoryList(dtos);
  }

  async getSalesByItem(params: GetDateRangeReportParams) {
    const dtos = await this.httpClient.get<SalesByItemDto[]>(
      API_ENDPOINTS.REPORTS.SALES_BY_ITEM,
      {
        params: definedParams({
          locationId: params.locationId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          limit: params.limit,
        }),
      },
    );
    return toSalesByItemList(dtos);
  }

  async getSalesByHour(params: GetDailyReportParams) {
    const dtos = await this.httpClient.get<SalesByHourDto[]>(
      API_ENDPOINTS.REPORTS.SALES_BY_HOUR,
      { params: definedParams({ locationId: params.locationId, date: params.date }) },
    );
    return toSalesByHourList(dtos);
  }

  async getServerPerformance(params: GetDateRangeReportParams) {
    const dtos = await this.httpClient.get<ServerPerformanceDto[]>(
      API_ENDPOINTS.REPORTS.SERVER_PERFORMANCE,
      {
        params: definedParams({
          locationId: params.locationId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          limit: params.limit,
        }),
      },
    );
    return toServerPerformanceList(dtos);
  }

  async getZReport(params: GetDailyReportParams) {
    const dto = await this.httpClient.get<ZReportDto>(API_ENDPOINTS.REPORTS.Z_REPORT, {
      params: definedParams({ locationId: params.locationId, date: params.date }),
    });
    return toZReport(dto);
  }

  async getSalesSummary(params: GetBusinessDateReportParams) {
    const dto = await this.httpClient.get<SalesSummaryDto>(
      API_ENDPOINTS.REPORTS.SALES_SUMMARY,
      {
        params: definedParams({
          from: params.from,
          to: params.to,
          locationId: params.locationId,
        }),
      },
    );
    return toSalesSummary(dto);
  }

  async getItemSales(params: GetItemSalesParams) {
    const dto = await this.httpClient.get<ItemSalesDto>(API_ENDPOINTS.REPORTS.ITEM_SALES, {
      params: definedParams({
        from: params.from,
        to: params.to,
        locationId: params.locationId,
        page: params.page,
        limit: params.limit,
        search: params.search,
        categoryId: params.categoryId,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
    });
    return toItemSales(dto);
  }

  async getOtherIncomeExpenses(params: GetBusinessDateReportParams) {
    const dto = await this.httpClient.get<OtherIncomeDto>(
      API_ENDPOINTS.REPORTS.OTHER_INCOME_EXPENSES,
      {
        params: definedParams({
          from: params.from,
          to: params.to,
          locationId: params.locationId,
        }),
      },
    );
    return toOtherIncome(dto);
  }

  async getMemberCards(params: GetBusinessDateReportParams) {
    const dto = await this.httpClient.get<MemberCardDto>(
      API_ENDPOINTS.REPORTS.MEMBER_CARDS,
      {
        params: definedParams({
          from: params.from,
          to: params.to,
          locationId: params.locationId,
        }),
      },
    );
    return toMemberCards(dto);
  }

  async getLoyaltyPoints(params: GetLoyaltyPointsParams) {
    const dto = await this.httpClient.get<LoyaltyPointsDto>(
      API_ENDPOINTS.REPORTS.LOYALTY_POINTS,
      {
        params: definedParams({
          from: params.from,
          to: params.to,
          locationId: params.locationId,
          top: params.top,
        }),
      },
    );
    return toLoyaltyPoints(dto);
  }
}
