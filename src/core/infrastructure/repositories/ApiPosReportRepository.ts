import type {
  BarCategoryReport,
  HostessReport,
  KtvSessionReport,
  PosBillsReport,
  PosType,
  SpaMenuReport,
} from "@/core/domain/entities/PosReport";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export interface PosRangeParams {
  from: string;
  to?: string;
  locationId?: string;
}

export interface PosBillsParams extends PosRangeParams {
  posType: PosType;
  page?: number;
  limit?: number;
  search?: string;
}

const defined = (input: Record<string, string | number | undefined>) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== ""),
  ) as Record<string, string | number>;

export class ApiPosReportRepository {
  constructor(private readonly httpClient: HttpClient) {}

  bills(params: PosBillsParams) {
    return this.httpClient.get<PosBillsReport>(API_ENDPOINTS.REPORTS.POS_BILLS, {
      params: defined({ ...params }),
    });
  }

  barCategories(params: PosRangeParams) {
    return this.httpClient.get<BarCategoryReport>(API_ENDPOINTS.REPORTS.BAR_CATEGORIES, {
      params: defined({ ...params }),
    });
  }

  spaMenu(params: PosRangeParams) {
    return this.httpClient.get<SpaMenuReport>(API_ENDPOINTS.REPORTS.SPA_MENU, {
      params: defined({ ...params }),
    });
  }

  ktvSessions(params: PosRangeParams) {
    return this.httpClient.get<KtvSessionReport>(API_ENDPOINTS.REPORTS.KTV_SESSIONS, {
      params: defined({ ...params }),
    });
  }

  hostesses(params: PosRangeParams) {
    return this.httpClient.get<HostessReport>(API_ENDPOINTS.REPORTS.HOSTESSES, {
      params: defined({ ...params }),
    });
  }
}
