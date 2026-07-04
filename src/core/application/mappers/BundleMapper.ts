import type { BundleDto, BundleComponentDto } from "@/core/application/dtos/BundleDto";
import type { Bundle, BundleComponent } from "@/core/domain/entities/Bundle";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toComponent(dto: BundleComponentDto): BundleComponent {
  return {
    id: dto.id,
    bundleId: dto.bundleId,
    variantId: dto.variantId ?? "",
    quantity: toNumber(dto.quantity, 1),
    swapGroupId: dto.swapGroupId ?? null,
  };
}

export function toBundle(dto: BundleDto & { id: string }): Bundle {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    productId: dto.productId ?? "",
    name: dto.name ?? "",
    description: dto.description ?? null,
    isActive: Boolean(dto.isActive),
    components: Array.isArray(dto.components)
      ? dto.components.map((item) => toComponent(item))
      : [],
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
