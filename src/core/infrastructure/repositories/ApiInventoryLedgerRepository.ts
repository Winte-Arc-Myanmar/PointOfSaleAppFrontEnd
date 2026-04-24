/**
 * Inventory ledger HTTP repository.
 */

import type {
  IInventoryLedgerRepository,
  GetInventoryLedgerExpiringParams,
  GetInventoryLedgerParams,
} from "@/core/domain/repositories/IInventoryLedgerRepository";
import type { InventoryLedgerEntry } from "@/core/domain/entities/InventoryLedgerEntry";
import type {
  InventoryLedgerDto,
  InventoryLedgerWriteOffDto,
} from "@/core/application/dtos/InventoryLedgerDto";
import { toInventoryLedgerEntry } from "@/core/application/mappers/InventoryLedgerMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function toApiDecimalString(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return "0";
    const n = Number(t);
    return Number.isFinite(n) ? String(n) : "0";
  }
  return "0";
}

function normalizeCreate(
  data: Omit<InventoryLedgerDto, "id" | "createdAt">
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    tenantId: data.tenantId,
    locationId: data.locationId,
    variantId: data.variantId,
    transactionType: data.transactionType,
    quantity: toApiDecimalString(data.quantity),
    unitCost: toApiDecimalString(data.unitCost),
  };
  const ref = data.referenceId?.trim();
  if (ref) out.referenceId = ref;
  const sn = data.serialNumber?.trim();
  if (sn) out.serialNumber = sn;
  const bn = data.batchNumber?.trim();
  if (bn) out.batchNumber = bn;
  const md = data.manufacturingDate?.trim();
  if (md) out.manufacturingDate = md;
  const ed = data.expiryDate?.trim();
  if (ed) out.expiryDate = ed;
  const cb = data.createdBy?.trim();
  if (cb) out.createdBy = cb;
  return out;
}

function normalizeWriteOff(
  data: InventoryLedgerWriteOffDto
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    tenantId: data.tenantId,
    variantId: data.variantId,
    locationId: data.locationId,
    quantity: toApiDecimalString(data.quantity),
    reason: data.reason,
    unitCost: toApiDecimalString(data.unitCost ?? 0),
  };
  const bn = data.batchNumber?.trim();
  if (bn) out.batchNumber = bn;
  return out;
}

export class ApiInventoryLedgerRepository implements IInventoryLedgerRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetInventoryLedgerParams): Promise<InventoryLedgerEntry[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const res = await this.httpClient.get<
      InventoryLedgerDto[] | { data?: InventoryLedgerDto[] }
    >(API_ENDPOINTS.INVENTORY_LEDGER.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is InventoryLedgerDto & { id: string } => !!d?.id)
      .map((d) => toInventoryLedgerEntry(d as InventoryLedgerDto & { id: string }));
  }

  async getExpiring(
    params?: GetInventoryLedgerExpiringParams
  ): Promise<InventoryLedgerEntry[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      days: params?.days ?? 30,
    };
    const res = await this.httpClient.get<
      InventoryLedgerDto[] | { data?: InventoryLedgerDto[] }
    >(API_ENDPOINTS.INVENTORY_LEDGER.EXPIRING, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is InventoryLedgerDto & { id: string } => !!d?.id)
      .map((d) => toInventoryLedgerEntry(d as InventoryLedgerDto & { id: string }));
  }

  async getById(id: string): Promise<InventoryLedgerEntry | null> {
    try {
      const dto = await this.httpClient.get<InventoryLedgerDto>(
        API_ENDPOINTS.INVENTORY_LEDGER.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toInventoryLedgerEntry(dto as InventoryLedgerDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<InventoryLedgerDto, "id" | "createdAt">
  ): Promise<InventoryLedgerEntry> {
    const dto = await this.httpClient.post<InventoryLedgerDto>(
      API_ENDPOINTS.INVENTORY_LEDGER.CREATE,
      normalizeCreate(data)
    );
    if (!dto?.id) throw new Error("Create ledger entry response missing id");
    return toInventoryLedgerEntry(dto as InventoryLedgerDto & { id: string });
  }

  async writeOff(
    data: InventoryLedgerWriteOffDto
  ): Promise<InventoryLedgerEntry> {
    const dto = await this.httpClient.post<InventoryLedgerDto>(
      API_ENDPOINTS.INVENTORY_LEDGER.WRITE_OFF,
      normalizeWriteOff(data)
    );
    if (!dto?.id) throw new Error("Write-off response missing id");
    return toInventoryLedgerEntry(dto as InventoryLedgerDto & { id: string });
  }

  async getBalance(variantId: string, locationId: string): Promise<unknown> {
    return this.httpClient.get<unknown>(
      API_ENDPOINTS.INVENTORY_LEDGER.BALANCE(variantId, locationId)
    );
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.INVENTORY_LEDGER.DELETE(id));
  }
}


