import axios from "axios";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import type { IAiConnection } from "@/core/domain/repositories/IAiConnection";
import type {
  AiConnectionStatus,
  ChatCompletionRequest,
  ChatCompletionResult,
} from "@/core/domain/entities/AiAgent";
import type {
  AiStatusDto,
  ChatCompletionResponseDto,
} from "@/core/application/dtos/AiChatDto";
import {
  toChatCompletionRequestDto,
  toChatCompletionResult,
} from "@/core/application/mappers/AiChatMapper";

const COMPLETION_TIMEOUT_MS = 60_000;

const NOT_CONFIGURED_MESSAGE =
  "Backend AI is not connected yet. Add GET /v1/ai/status and POST /v1/ai/chat/completions (OpenAI-compatible, session Bearer token). Keep the provider API key on the server.";

/**
 * Standard AI connection: OpenAI-compatible Chat Completions over the POS API.
 * Swap is not needed later — only the backend implementation of these routes.
 */
export class ApiAiConnection implements IAiConnection {
  constructor(private readonly httpClient: HttpClient) {}

  async getStatus(): Promise<AiConnectionStatus> {
    try {
      const dto = await this.httpClient.get<AiStatusDto>(
        API_ENDPOINTS.AI.STATUS,
      );
      if (dto?.ready) {
        return {
          state: "ready",
          provider: dto.provider,
          model: dto.model,
          message: dto.message ?? "AI connection is ready.",
        };
      }
      return {
        state: "not_configured",
        provider: dto?.provider,
        model: dto?.model,
        message: dto?.message ?? NOT_CONFIGURED_MESSAGE,
      };
    } catch (error) {
      if (isNotImplemented(error)) {
        return {
          state: "not_configured",
          message: NOT_CONFIGURED_MESSAGE,
        };
      }
      return {
        state: "error",
        message: errorMessage(error, "Could not reach the AI connection."),
      };
    }
  }

  async complete(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResult> {
    try {
      const dto = await this.httpClient.post<ChatCompletionResponseDto>(
        API_ENDPOINTS.AI.CHAT_COMPLETIONS,
        toChatCompletionRequestDto(request),
        { timeout: COMPLETION_TIMEOUT_MS },
      );
      return toChatCompletionResult(dto);
    } catch (error) {
      if (isNotImplemented(error)) {
        throw new Error(NOT_CONFIGURED_MESSAGE);
      }
      throw new Error(
        errorMessage(error, "AI chat completion request failed."),
      );
    }
  }
}

function isNotImplemented(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 404 || status === 501;
}

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
