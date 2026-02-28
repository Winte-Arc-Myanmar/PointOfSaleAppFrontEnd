"use client";

import container from "@/core/infrastructure/di/container";
import type { IAuthService } from "@/core/domain/services/IAuthService";

/**
 * Resolves auth service for presentation layer.
 * Keeps container dependency in hooks instead of feature components.
 */
export function useAuthService(): IAuthService {
  return container.resolve<IAuthService>("authService");
}
