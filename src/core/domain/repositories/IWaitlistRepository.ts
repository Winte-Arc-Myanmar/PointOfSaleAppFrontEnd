import type {
  WaitlistCreateDto,
  WaitlistSeatDto,
  WaitlistUpdateDto,
} from "@/core/application/dtos/WaitlistDto";
import type {
  WaitlistEntry,
  WaitlistSeatResult,
  WaitlistStatus,
} from "@/core/domain/entities/Waitlist";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface GetWaitlistParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  status?: WaitlistStatus;
  activeOnly?: boolean;
}

export interface IWaitlistRepository {
  getAll(params?: GetWaitlistParams): Promise<PaginatedResult<WaitlistEntry>>;
  getById(id: string): Promise<WaitlistEntry | null>;
  create(data: WaitlistCreateDto): Promise<WaitlistEntry>;
  update(id: string, data: WaitlistUpdateDto): Promise<WaitlistEntry>;
  notify(id: string): Promise<WaitlistEntry>;
  seat(id: string, data: WaitlistSeatDto): Promise<WaitlistSeatResult>;
  cancel(id: string): Promise<WaitlistEntry>;
  noShow(id: string): Promise<WaitlistEntry>;
}
