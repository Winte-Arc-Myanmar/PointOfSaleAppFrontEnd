import type {
  GetTableSessionsParams,
  ITableSessionRepository,
} from "@/core/domain/repositories/ITableSessionRepository";
import type { ITableSessionService } from "@/core/domain/services/ITableSessionService";
import type {
  TableSession,
  TableSessionSeatAllocation,
} from "@/core/domain/entities/TableSession";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type {
  TableSessionAddLineDto,
  TableSessionAllocateSeatDto,
  TableSessionCheckoutDto,
  TableSessionCreateDto,
  TableSessionStateTransitionDto,
  TableSessionUpdateDto,
} from "@/core/application/dtos/TableSessionDto";

export class TableSessionService implements ITableSessionService {
  constructor(private readonly tableSessionRepository: ITableSessionRepository) {}

  getAll(params?: GetTableSessionsParams): Promise<PaginatedResult<TableSession>> {
    return this.tableSessionRepository.getAll(params);
  }

  getById(id: string): Promise<TableSession | null> {
    return this.tableSessionRepository.getById(id);
  }

  create(data: TableSessionCreateDto): Promise<TableSession> {
    return this.tableSessionRepository.create(data);
  }

  update(id: string, data: TableSessionUpdateDto): Promise<TableSession> {
    return this.tableSessionRepository.update(id, data);
  }

  transitionState(id: string, data: TableSessionStateTransitionDto): Promise<TableSession> {
    return this.tableSessionRepository.transitionState(id, data);
  }

  addLine(id: string, data: TableSessionAddLineDto): Promise<void> {
    return this.tableSessionRepository.addLine(id, data);
  }

  allocateSeat(id: string, data: TableSessionAllocateSeatDto): Promise<TableSessionSeatAllocation> {
    return this.tableSessionRepository.allocateSeat(id, data);
  }

  removeSeat(id: string, allocationId: string): Promise<TableSessionSeatAllocation> {
    return this.tableSessionRepository.removeSeat(id, allocationId);
  }

  checkout(id: string, data: TableSessionCheckoutDto): Promise<TableSession> {
    return this.tableSessionRepository.checkout(id, data);
  }
}
