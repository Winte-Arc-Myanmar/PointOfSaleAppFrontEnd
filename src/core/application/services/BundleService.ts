import type {
  BundleCreateDto,
  BundleUpdateDto,
} from "@/core/application/dtos/BundleDto";
import type { Bundle } from "@/core/domain/entities/Bundle";
import type {
  GetBundlesParams,
  IBundleRepository,
} from "@/core/domain/repositories/IBundleRepository";
import type { IBundleService } from "@/core/domain/services/IBundleService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class BundleService implements IBundleService {
  constructor(private readonly repository: IBundleRepository) {}

  getAll(params?: GetBundlesParams): Promise<PaginatedResult<Bundle>> {
    return this.repository.getAll(params);
  }

  getById(id: string): Promise<Bundle | null> {
    return this.repository.getById(id);
  }

  create(data: BundleCreateDto): Promise<Bundle> {
    return this.repository.create(data);
  }

  update(id: string, data: BundleUpdateDto): Promise<Bundle> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
