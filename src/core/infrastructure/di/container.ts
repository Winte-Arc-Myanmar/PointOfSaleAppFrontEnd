/**
 * DI container - wires infrastructure to application.
 * Infrastructure layer.
 */

import { HttpClient } from "../api/HttpClient";
import { ApiProductRepository } from "../repositories/ApiProductRepository";
import { ProductService } from "@/core/application/services/ProductService";
import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { IProductService } from "@/core/domain/services/IProductService";

class Container {
  private instances = new Map<string, unknown>();

  constructor() {
    const httpClient = new HttpClient();
    const productRepository = new ApiProductRepository(httpClient);
    const productService = new ProductService(productRepository);

    this.register("httpClient", httpClient);
    this.register<IProductRepository>("productRepository", productRepository);
    this.register<IProductService>("productService", productService);
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
