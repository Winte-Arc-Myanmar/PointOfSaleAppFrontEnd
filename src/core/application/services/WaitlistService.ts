import type {
  WaitlistCreateDto,
  WaitlistSeatDto,
  WaitlistUpdateDto,
} from "@/core/application/dtos/WaitlistDto";
import type { WaitlistEntry, WaitlistSeatResult } from "@/core/domain/entities/Waitlist";
import type { GetWaitlistParams, IWaitlistRepository } from "@/core/domain/repositories/IWaitlistRepository";
import type { IWaitlistService } from "@/core/domain/services/IWaitlistService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class WaitlistService implements IWaitlistService {
  constructor(private readonly waitlistRepository: IWaitlistRepository) {}

  getAll(params?: GetWaitlistParams): Promise<PaginatedResult<WaitlistEntry>> {
    return this.waitlistRepository.getAll(params);
  }

  getById(id: string): Promise<WaitlistEntry | null> {
    return this.waitlistRepository.getById(id);
  }

  create(data: WaitlistCreateDto): Promise<WaitlistEntry> {
    return this.waitlistRepository.create(data);
  }

  update(id: string, data: WaitlistUpdateDto): Promise<WaitlistEntry> {
    return this.waitlistRepository.update(id, data);
  }

  notify(id: string): Promise<WaitlistEntry> {
    return this.waitlistRepository.notify(id);
  }

  seat(id: string, data: WaitlistSeatDto): Promise<WaitlistSeatResult> {
    return this.waitlistRepository.seat(id, data);
  }

  cancel(id: string): Promise<WaitlistEntry> {
    return this.waitlistRepository.cancel(id);
  }

  noShow(id: string): Promise<WaitlistEntry> {
    return this.waitlistRepository.noShow(id);
  }
}
