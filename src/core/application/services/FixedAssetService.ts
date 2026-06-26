import type { IFixedAssetService } from "@/core/domain/services/IFixedAssetService";
import type { IFixedAssetRepository } from "@/core/domain/repositories/IFixedAssetRepository";
import type { FixedAsset } from "@/core/domain/entities/FixedAsset";
import type {
  GetFixedAssetsParams,
  FixedAssetWriteDto,
} from "@/core/domain/repositories/IFixedAssetRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class FixedAssetService implements IFixedAssetService {
  constructor(private readonly fixedAssetRepository: IFixedAssetRepository) {}

  getAll(params?: GetFixedAssetsParams): Promise<PaginatedResult<FixedAsset>> {
    return this.fixedAssetRepository.getAll(params);
  }

  getById(id: string): Promise<FixedAsset | null> {
    return this.fixedAssetRepository.getById(id);
  }

  create(data: FixedAssetWriteDto): Promise<FixedAsset> {
    return this.fixedAssetRepository.create(data);
  }

  update(id: string, data: FixedAssetWriteDto): Promise<FixedAsset> {
    return this.fixedAssetRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.fixedAssetRepository.delete(id);
  }
}
