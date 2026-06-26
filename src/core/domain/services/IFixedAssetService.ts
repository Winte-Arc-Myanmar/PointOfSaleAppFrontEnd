import type { FixedAsset } from "../entities/FixedAsset";
import type {
  GetFixedAssetsParams,
  FixedAssetWriteDto,
} from "../repositories/IFixedAssetRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IFixedAssetService {
  getAll(params?: GetFixedAssetsParams): Promise<PaginatedResult<FixedAsset>>;
  getById(id: string): Promise<FixedAsset | null>;
  create(data: FixedAssetWriteDto): Promise<FixedAsset>;
  update(id: string, data: FixedAssetWriteDto): Promise<FixedAsset>;
  delete(id: string): Promise<void>;
}
