/**
 * UOM entity <-> DTO mappers.
 * Application layer.
 */

import type { Uom } from "@/core/domain/entities/Uom";
import type { UomDto } from "../dtos/UomDto";

/** API may return conversionRateToBase as Decimal.js-style { s, e, d }; convert to number. */
function parseDecimal(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (
    val != null &&
    typeof val === "object" &&
    "s" in val &&
    "e" in val &&
    "d" in val
  ) {
    const { s, e, d } = val as { s: number; e: number; d: number[] };
    if (!Array.isArray(d)) return 0;
    let n = 0;
    for (let i = 0; i < d.length; i++) {
      n += d[i] * Math.pow(10, e - i * 7);
    }
    return s * n;
  }
  return Number(val) || 0;
}

type UomDtoRaw = Omit<UomDto, "conversionRateToBase"> & {
  id: string;
  conversionRateToBase?: unknown;
};

export function toUom(dto: UomDtoRaw): Uom {
  return {
    id: dto.id,
    name: dto.name ?? "",
    classId: dto.classId ?? "",
    abbreviation: dto.abbreviation ?? "",
    conversionRateToBase: parseDecimal(dto.conversionRateToBase),
  };
}

export function toUomDto(uom: Partial<Uom>): UomDto {
  return {
    ...(uom.id && { id: uom.id }),
    name: uom.name ?? "",
    classId: uom.classId ?? "",
    abbreviation: uom.abbreviation ?? "",
    conversionRateToBase: uom.conversionRateToBase ?? 0,
  };
}
