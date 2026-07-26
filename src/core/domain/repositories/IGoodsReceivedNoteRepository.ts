import type { GoodsReceivedNote } from "../entities/GoodsReceivedNote";
import type { GoodsReceivedNoteDto } from "@/core/application/dtos/GoodsReceivedNoteDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetGoodsReceivedNotesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type GoodsReceivedNoteWriteDto = Omit<
  GoodsReceivedNoteDto,
  "id" | "receivedAt" | "status" | "createdAt" | "updatedAt"
>;

export interface IGoodsReceivedNoteRepository {
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
