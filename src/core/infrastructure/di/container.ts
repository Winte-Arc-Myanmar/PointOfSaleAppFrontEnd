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
import { ProductService } from "@/core/application/services/ProductService";
import { ProductVariantService } from "@/core/application/services/ProductVariantService";
import { AuthService } from "@/core/application/services/AuthService";
import { TenantService } from "@/core/application/services/TenantService";
import { UserService } from "@/core/application/services/UserService";
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { IProductVariantRepository } from "@/core/domain/repositories/IProductVariantRepository";
import type { IAuthRepository } from "@/core/domain/repositories/IAuthRepository";
import type { ITenantRepository } from "@/core/domain/repositories/ITenantRepository";
import type { IUserRepository } from "@/core/domain/repositories/IUserRepository";
import type { IProductService } from "@/core/domain/services/IProductService";
import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";
import type { IAuthService } from "@/core/domain/services/IAuthService";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IUserService } from "@/core/domain/services/IUserService";

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
    const productVariantRepository = new ApiProductVariantRepository(httpClient);
    const productVariantService = new ProductVariantService(
      productVariantRepository
    );

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
