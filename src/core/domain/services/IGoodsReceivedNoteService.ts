import type { GoodsReceivedNote } from "../entities/GoodsReceivedNote";
import type {
  GetGoodsReceivedNotesParams,
  GoodsReceivedNoteWriteDto,
} from "../repositories/IGoodsReceivedNoteRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IGoodsReceivedNoteService {
  getAll(
    params?: GetGoodsReceivedNotesParams,
  ): Promise<PaginatedResult<GoodsReceivedNote>>;
  getById(id: string): Promise<GoodsReceivedNote | null>;
  create(data: GoodsReceivedNoteWriteDto): Promise<GoodsReceivedNote>;
  update(
    id: string,
    data: GoodsReceivedNoteWriteDto,
  ): Promise<GoodsReceivedNote>;
  delete(id: string): Promise<void>;
}
