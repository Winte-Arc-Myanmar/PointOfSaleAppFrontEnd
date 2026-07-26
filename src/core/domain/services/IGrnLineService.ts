import type { GrnLine } from "../entities/GrnLine";
import type {
  GetGrnLinesParams,
  GrnLineWriteDto,
} from "../repositories/IGrnLineRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IGrnLineService {
  getAll(
    grnId: string,
    params?: GetGrnLinesParams,
  ): Promise<PaginatedResult<GrnLine>>;
  getById(grnId: string, id: string): Promise<GrnLine | null>;
  create(grnId: string, data: GrnLineWriteDto): Promise<GrnLine>;
  update(grnId: string, id: string, data: GrnLineWriteDto): Promise<GrnLine>;
  delete(grnId: string, id: string): Promise<void>;
}
