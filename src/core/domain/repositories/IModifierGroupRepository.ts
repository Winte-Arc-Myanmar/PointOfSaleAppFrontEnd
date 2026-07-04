import type {
  Modifier,
  ModifierGroup,
} from "../entities/ModifierGroup";
import type {
  ModifierCreateDto,
  ModifierGroupAttachProductDto,
  ModifierGroupCreateDto,
  ModifierGroupUpdateDto,
  ModifierUpdateDto,
} from "@/core/application/dtos/ModifierGroupDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetModifierGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface GetModifiersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IModifierGroupRepository {
  getAll(params?: GetModifierGroupsParams): Promise<PaginatedResult<ModifierGroup>>;
  getById(id: string): Promise<ModifierGroup | null>;
  create(data: ModifierGroupCreateDto): Promise<ModifierGroup>;
  update(id: string, data: ModifierGroupUpdateDto): Promise<ModifierGroup>;
  delete(id: string): Promise<void>;

  attachProduct(id: string, data: ModifierGroupAttachProductDto): Promise<void>;
  detachProduct(id: string, productId: string): Promise<void>;

  listModifiers(groupId: string, params?: GetModifiersParams): Promise<PaginatedResult<Modifier>>;
  getModifierById(groupId: string, id: string): Promise<Modifier | null>;
  createModifier(groupId: string, data: ModifierCreateDto): Promise<Modifier>;
  updateModifier(groupId: string, id: string, data: ModifierUpdateDto): Promise<Modifier>;
  deleteModifier(groupId: string, id: string): Promise<void>;
}
