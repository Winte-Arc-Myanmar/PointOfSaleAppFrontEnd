import type {
  TableSession,
  TableSessionSeatAllocation,
} from "@/core/domain/entities/TableSession";
import type {
  TableSessionAddLineDto,
  TableSessionAllocateSeatDto,
  TableSessionCheckoutDto,
  TableSessionCreateDto,
  TableSessionStateTransitionDto,
  TableSessionUpdateDto,
} from "@/core/application/dtos/TableSessionDto";
import type {
  GetTableSessionsParams,
} from "@/core/domain/repositories/ITableSessionRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface ITableSessionService {
  getAll(params?: GetTableSessionsParams): Promise<PaginatedResult<TableSession>>;
  getById(id: string): Promise<TableSession | null>;
  create(data: TableSessionCreateDto): Promise<TableSession>;
  update(id: string, data: TableSessionUpdateDto): Promise<TableSession>;
  transitionState(id: string, data: TableSessionStateTransitionDto): Promise<TableSession>;
  addLine(id: string, data: TableSessionAddLineDto): Promise<void>;
  allocateSeat(id: string, data: TableSessionAllocateSeatDto): Promise<TableSessionSeatAllocation>;
  removeSeat(id: string, allocationId: string): Promise<TableSessionSeatAllocation>;
  checkout(id: string, data: TableSessionCheckoutDto): Promise<TableSession>;
}
