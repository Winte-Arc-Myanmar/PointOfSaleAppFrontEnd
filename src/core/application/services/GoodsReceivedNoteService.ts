import type { IGoodsReceivedNoteService } from "@/core/domain/services/IGoodsReceivedNoteService";
import type { IGoodsReceivedNoteRepository } from "@/core/domain/repositories/IGoodsReceivedNoteRepository";
import type { GoodsReceivedNote } from "@/core/domain/entities/GoodsReceivedNote";
import type {
  GetGoodsReceivedNotesParams,
  GoodsReceivedNoteWriteDto,
} from "@/core/domain/repositories/IGoodsReceivedNoteRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class GoodsReceivedNoteService implements IGoodsReceivedNoteService {
  constructor(
    private readonly goodsReceivedNoteRepository: IGoodsReceivedNoteRepository,
  ) {}

  getAll(
    params?: GetGoodsReceivedNotesParams,
  ): Promise<PaginatedResult<GoodsReceivedNote>> {
    return this.goodsReceivedNoteRepository.getAll(params);
  }

  getById(id: string): Promise<GoodsReceivedNote | null> {
    return this.goodsReceivedNoteRepository.getById(id);
  }

  create(data: GoodsReceivedNoteWriteDto): Promise<GoodsReceivedNote> {
    return this.goodsReceivedNoteRepository.create(data);
  }

  update(
    id: string,
    data: GoodsReceivedNoteWriteDto,
  ): Promise<GoodsReceivedNote> {
    return this.goodsReceivedNoteRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.goodsReceivedNoteRepository.delete(id);
  }
}
