/**
 * DI container - wires infrastructure to application.
 * Infrastructure layer.
 */

import { HttpClient } from "../api/HttpClient";
import { ApiProductRepository } from "../repositories/ApiProductRepository";
import { ApiAuthRepository } from "../repositories/ApiAuthRepository";
import { ApiTenantRepository } from "../repositories/ApiTenantRepository";
import { ApiUserRepository } from "../repositories/ApiUserRepository";
import { ApiProductVariantRepository } from "../repositories/ApiProductVariantRepository";
import { ApiUomClassRepository } from "../repositories/ApiUomClassRepository";
import { ApiUomRepository } from "../repositories/ApiUomRepository";
import { ApiCategoryRepository } from "../repositories/ApiCategoryRepository";
import { ApiBranchRepository } from "../repositories/ApiBranchRepository";
import { ApiSystemAdminRepository } from "../repositories/ApiSystemAdminRepository";
import { ProductService } from "@/core/application/services/ProductService";
import { ProductVariantService } from "@/core/application/services/ProductVariantService";
import { AuthService } from "@/core/application/services/AuthService";
import { TenantService } from "@/core/application/services/TenantService";
import { UserService } from "@/core/application/services/UserService";
import { UomClassService } from "@/core/application/services/UomClassService";
import { UomService } from "@/core/application/services/UomService";
import { CategoryService } from "@/core/application/services/CategoryService";
import { BranchService } from "@/core/application/services/BranchService";
import { SystemAdminService } from "@/core/application/services/SystemAdminService";
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { IProductVariantRepository } from "@/core/domain/repositories/IProductVariantRepository";
import type { IAuthRepository } from "@/core/domain/repositories/IAuthRepository";
import type { ITenantRepository } from "@/core/domain/repositories/ITenantRepository";
import type { IUserRepository } from "@/core/domain/repositories/IUserRepository";
import type { IUomClassRepository } from "@/core/domain/repositories/IUomClassRepository";
import type { IUomRepository } from "@/core/domain/repositories/IUomRepository";
import type { ICategoryRepository } from "@/core/domain/repositories/ICategoryRepository";
import type { IBranchRepository } from "@/core/domain/repositories/IBranchRepository";
import type { ISystemAdminRepository } from "@/core/domain/repositories/ISystemAdminRepository";
import type { IProductService } from "@/core/domain/services/IProductService";
import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";
import type { IAuthService } from "@/core/domain/services/IAuthService";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IUserService } from "@/core/domain/services/IUserService";
import type { IUomClassService } from "@/core/domain/services/IUomClassService";
import type { IUomService } from "@/core/domain/services/IUomService";
import type { ICategoryService } from "@/core/domain/services/ICategoryService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { ISystemAdminService } from "@/core/domain/services/ISystemAdminService";

class Container {
  private instances = new Map<string, unknown>();

  constructor() {
    const httpClient = new HttpClient();
    const productRepository = new ApiProductRepository(httpClient);
    const productService = new ProductService(productRepository);
    const authRepository = new ApiAuthRepository(httpClient);
    const authService = new AuthService(authRepository);
    const tenantRepository = new ApiTenantRepository(httpClient);
    const tenantService = new TenantService(tenantRepository);
    const userRepository = new ApiUserRepository(httpClient);
    const userService = new UserService(userRepository);
    const productVariantRepository = new ApiProductVariantRepository(
      httpClient
    );
    const productVariantService = new ProductVariantService(
      productVariantRepository
    );
    const uomClassRepository = new ApiUomClassRepository(httpClient);
    const uomClassService = new UomClassService(uomClassRepository);
    const uomRepository = new ApiUomRepository(httpClient);
    const uomService = new UomService(uomRepository);
    const categoryRepository = new ApiCategoryRepository(httpClient);
    const categoryService = new CategoryService(categoryRepository);
    const branchRepository = new ApiBranchRepository(httpClient);
    const branchService = new BranchService(branchRepository);
    const systemAdminRepository = new ApiSystemAdminRepository(httpClient);
    const systemAdminService = new SystemAdminService(systemAdminRepository);

    this.register("httpClient", httpClient);
    this.register<IProductRepository>("productRepository", productRepository);
    this.register<IProductService>("productService", productService);
    this.register<IAuthRepository>("authRepository", authRepository);
    this.register<IAuthService>("authService", authService);
    this.register<ITenantRepository>("tenantRepository", tenantRepository);
    this.register<ITenantService>("tenantService", tenantService);
    this.register<IUserRepository>("userRepository", userRepository);
    this.register<IUserService>("userService", userService);
    this.register<IProductVariantRepository>(
      "productVariantRepository",
      productVariantRepository
    );
    this.register<IProductVariantService>(
      "productVariantService",
      productVariantService
    );
    this.register<IUomClassRepository>(
      "uomClassRepository",
      uomClassRepository
    );
    this.register<IUomClassService>("uomClassService", uomClassService);
    this.register<IUomRepository>("uomRepository", uomRepository);
    this.register<IUomService>("uomService", uomService);
    this.register<ICategoryRepository>(
      "categoryRepository",
      categoryRepository
    );
    this.register<ICategoryService>("categoryService", categoryService);
    this.register<IBranchRepository>("branchRepository", branchRepository);
    this.register<IBranchService>("branchService", branchService);
    this.register<ISystemAdminRepository>("systemAdminRepository", systemAdminRepository);
    this.register<ISystemAdminService>("systemAdminService", systemAdminService);
  }

  register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) throw new Error(`No instance for key: ${key}`);
    return instance as T;
  }
}

const container = new Container();

export default container;
