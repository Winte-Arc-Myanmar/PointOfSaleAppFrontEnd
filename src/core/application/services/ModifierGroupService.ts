import type {
  Modifier,
  ModifierGroup,
} from "@/core/domain/entities/ModifierGroup";
import type {
  ModifierCreateDto,
  ModifierGroupAttachProductDto,
  ModifierGroupCreateDto,
  ModifierGroupUpdateDto,
  ModifierUpdateDto,
} from "@/core/application/dtos/ModifierGroupDto";
import type {
  GetModifierGroupsParams,
  GetModifiersParams,
  IModifierGroupRepository,
} from "@/core/domain/repositories/IModifierGroupRepository";
import type { IModifierGroupService } from "@/core/domain/services/IModifierGroupService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class ModifierGroupService implements IModifierGroupService {
  constructor(private readonly repository: IModifierGroupRepository) {}

  getAll(params?: GetModifierGroupsParams): Promise<PaginatedResult<ModifierGroup>> {
    return this.repository.getAll(params);
  }

  getById(id: string): Promise<ModifierGroup | null> {
    return this.repository.getById(id);
  }

  create(data: ModifierGroupCreateDto): Promise<ModifierGroup> {
    return this.repository.create(data);
  }

  update(id: string, data: ModifierGroupUpdateDto): Promise<ModifierGroup> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  attachProduct(id: string, data: ModifierGroupAttachProductDto): Promise<void> {
    return this.repository.attachProduct(id, data);
  }

  detachProduct(id: string, productId: string): Promise<void> {
    return this.repository.detachProduct(id, productId);
  }

  listModifiers(groupId: string, params?: GetModifiersParams): Promise<PaginatedResult<Modifier>> {
    return this.repository.listModifiers(groupId, params);
  }

  getModifierById(groupId: string, id: string): Promise<Modifier | null> {
    return this.repository.getModifierById(groupId, id);
  }

  createModifier(groupId: string, data: ModifierCreateDto): Promise<Modifier> {
    return this.repository.createModifier(groupId, data);
  }

  updateModifier(groupId: string, id: string, data: ModifierUpdateDto): Promise<Modifier> {
    return this.repository.updateModifier(groupId, id, data);
  }

  deleteModifier(groupId: string, id: string): Promise<void> {
    return this.repository.deleteModifier(groupId, id);
  }
}
