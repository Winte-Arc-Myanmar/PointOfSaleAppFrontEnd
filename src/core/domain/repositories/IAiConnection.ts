import type {
  AiConnectionStatus,
  ChatCompletionRequest,
  ChatCompletionResult,
} from "@/core/domain/entities/AiAgent";

/**
 * Port for the standard AI connection procedure.
 *
 * Implementations MUST speak OpenAI-compatible Chat Completions:
 * POST {API}/v1/ai/chat/completions with Bearer session auth,
 * messages[], optional tools[], tool_choice, and model.
 *
 * The backend (when added) proxies to the LLM provider and never
 * exposes provider API keys to the browser.
 */
export interface IAiConnection {
  getStatus(): Promise<AiConnectionStatus>;
  complete(request: ChatCompletionRequest): Promise<ChatCompletionResult>;
}
