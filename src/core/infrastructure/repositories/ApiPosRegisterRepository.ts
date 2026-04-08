import type {
  IPosRegisterRepository,
  GetPosRegistersParams,
} from "@/core/domain/repositories/IPosRegisterRepository";
import type { PosRegister } from "@/core/domain/entities/PosRegister";
import type { PosRegisterDto } from "@/core/application/dtos/PosRegisterDto";
import { toPosRegister } from "@/core/application/mappers/PosRegisterMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiPosRegisterRepository implements IPosRegisterRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetPosRegistersParams): Promise<PosRegister[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    };
    const res = await this.httpClient.get<
      PosRegisterDto[] | { data?: PosRegisterDto[] }
    >(API_ENDPOINTS.POS_REGISTERS.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((d): d is PosRegisterDto & { id: string } => !!d?.id)
      .map((d) => toPosRegister(d as PosRegisterDto & { id: string }));
  }

  async getById(id: string): Promise<PosRegister | null> {
    try {
      const dto = await this.httpClient.get<PosRegisterDto>(
        API_ENDPOINTS.POS_REGISTERS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toPosRegister(dto as PosRegisterDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PosRegister> {
    const dto = await this.httpClient.post<PosRegisterDto>(
      API_ENDPOINTS.POS_REGISTERS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create POS register response missing id");
    return toPosRegister(dto as PosRegisterDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PosRegister> {
    const dto = await this.httpClient.patch<PosRegisterDto>(
      API_ENDPOINTS.POS_REGISTERS.UPDATE(id),
      data
    );
    return toPosRegister({ ...dto, id: dto?.id ?? id } as PosRegisterDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.POS_REGISTERS.DELETE(id));
  }
}

