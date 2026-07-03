import type {
  WaitlistCreateDto,
  WaitlistSeatDto,
  WaitlistUpdateDto,
} from "@/core/application/dtos/WaitlistDto";
import type { GetWaitlistParams } from "@/core/domain/repositories/IWaitlistRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { WaitlistEntry, WaitlistSeatResult } from "@/core/domain/entities/Waitlist";

export interface IWaitlistService {
  getAll(params?: GetWaitlistParams): Promise<PaginatedResult<WaitlistEntry>>;
  getById(id: string): Promise<WaitlistEntry | null>;
  create(data: WaitlistCreateDto): Promise<WaitlistEntry>;
  update(id: string, data: WaitlistUpdateDto): Promise<WaitlistEntry>;
  notify(id: string): Promise<WaitlistEntry>;
  seat(id: string, data: WaitlistSeatDto): Promise<WaitlistSeatResult>;
  cancel(id: string): Promise<WaitlistEntry>;
  noShow(id: string): Promise<WaitlistEntry>;
}
