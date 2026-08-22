/**
 * OpenAI-compatible Chat Completions DTOs.
 * Backend /v1/ai/chat/completions should accept and return this shape
 * (optionally wrapped as { success, message, data }).
 */

export interface ChatCompletionMessageDto {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type?: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ChatCompletionToolDto {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionRequestDto {
  model: string;
  messages: ChatCompletionMessageDto[];
  tools?: ChatCompletionToolDto[];
  tool_choice?: "auto" | "none";
  temperature?: number;
}

export interface ChatCompletionResponseDto {
  id?: string;
  model?: string;
  choices?: Array<{
    index?: number;
    finish_reason?: string | null;
    message?: ChatCompletionMessageDto;
  }>;
  error?: {
    message?: string;
    code?: string;
  };
}

export interface AiStatusDto {
  ready?: boolean;
  provider?: string;
  model?: string;
  message?: string;
}
