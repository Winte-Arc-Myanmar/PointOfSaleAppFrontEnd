import type { DepreciationSchedule } from "@/core/domain/entities/DepreciationSchedule";
import type { DepreciationScheduleDto } from "../dtos/DepreciationScheduleDto";

export function toDepreciationSchedule(
  fixedAssetId: string,
  dto: DepreciationScheduleDto & { id: string }
): DepreciationSchedule {
  return {
    id: dto.id,
    assetId: dto.assetId ?? fixedAssetId,
    scheduledDate: dto.scheduledDate ?? "",
    depreciationAmount: dto.depreciationAmount ?? "0.00",
    isPosted: Boolean(dto.isPosted),
    postedJournalEntryId: dto.postedJournalEntryId ?? null,
  };
}

export function toDepreciationScheduleDto(
  schedule: Partial<DepreciationSchedule>
): DepreciationScheduleDto {
  return {
    ...(schedule.id && { id: String(schedule.id) }),
    scheduledDate: schedule.scheduledDate ?? "",
    depreciationAmount: schedule.depreciationAmount ?? "0.00",
    isPosted: schedule.isPosted ?? false,
    postedJournalEntryId: schedule.postedJournalEntryId ?? null,
  };
}
