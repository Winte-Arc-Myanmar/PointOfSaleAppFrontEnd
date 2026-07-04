export interface BundleComponentDto {
  id?: string;
  bundleId?: string;
  variantId: string;
  quantity: number;
  swapGroupId?: string | null;
}

export interface BundleDto {
  id?: string;
  tenantId: string;
  productId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  components?: BundleComponentDto[];
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type BundleComponentInputDto = Pick<
  BundleComponentDto,
  "variantId" | "quantity" | "swapGroupId"
>;

export type BundleCreateDto = Pick<
  BundleDto,
  "tenantId" | "productId" | "name" | "description" | "isActive"
> & {
  components: BundleComponentInputDto[];
};

export type BundleUpdateDto = {
  name?: string;
  description?: string;
  isActive?: boolean;
  components?: BundleComponentInputDto[];
};
