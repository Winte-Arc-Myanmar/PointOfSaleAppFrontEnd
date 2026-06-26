import type { ReconciliationMatch } from "@/core/domain/entities/ReconciliationMatch";
import type { ReconciliationMatchDto } from "../dtos/ReconciliationMatchDto";

export function toReconciliationMatch(
  dto: ReconciliationMatchDto & { id: string }
): ReconciliationMatch {
  return {
    id: dto.id,
    statementLineId: dto.statementLineId ?? "",
    journalLineId: dto.journalLineId ?? "",
    matchedBy: dto.matchedBy ?? "",
    matchedAt: dto.matchedAt ?? null,
  };
}

export function toReconciliationMatchDto(
  match: Partial<ReconciliationMatch>
): ReconciliationMatchDto {
  return {
    ...(match.id && { id: String(match.id) }),
    statementLineId: match.statementLineId ?? "",
    journalLineId: match.journalLineId ?? "",
    matchedBy: match.matchedBy ?? "",
  };
}
