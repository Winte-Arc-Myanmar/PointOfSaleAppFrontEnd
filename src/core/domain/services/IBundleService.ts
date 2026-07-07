import type {
  BundleCreateDto,
  BundleUpdateDto,
} from "@/core/application/dtos/BundleDto";
import type { Bundle } from "../entities/Bundle";
import type {
  GetBundlesParams,
  IBundleRepository,
} from "../repositories/IBundleRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IBundleService extends IBundleRepository {}

export type { GetBundlesParams };
