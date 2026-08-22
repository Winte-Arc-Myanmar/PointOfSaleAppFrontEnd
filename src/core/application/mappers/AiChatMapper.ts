import type {
  AgentFinishReason,
  AgentMessage,
  AgentTool,
  ChatCompletionRequest,
  ChatCompletionResult,
} from "@/core/domain/entities/AiAgent";
import type {
  ChatCompletionMessageDto,
  ChatCompletionRequestDto,
  ChatCompletionResponseDto,
  ChatCompletionToolDto,
} from "../dtos/AiChatDto";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createAgentMessage(
  role: AgentMessage["role"],
  content: string,
  extras?: Partial<Pick<AgentMessage, "toolCallId" | "toolCalls">>,
): AgentMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extras,
  };
}

function toMessageDto(message: AgentMessage): ChatCompletionMessageDto {
  const dto: ChatCompletionMessageDto = {
    role: message.role,
    content: message.content || "",
  };
  if (message.toolCallId) dto.tool_call_id = message.toolCallId;
  if (message.toolCalls?.length) {
    dto.tool_calls = message.toolCalls.map((call) => ({
      id: call.id,
      type: "function",
      function: {
        name: call.name,
        arguments: call.argumentsJson,
      },
    }));
  }
  return dto;
}

function toToolDto(tool: AgentTool): ChatCompletionToolDto {
  return {
    type: "function",
    function: {
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters,
    },
  };
}

export function toChatCompletionRequestDto(
  request: ChatCompletionRequest,
): ChatCompletionRequestDto {
  const dto: ChatCompletionRequestDto = {
    model: request.model,
    messages: request.messages.map(toMessageDto),
  };
  if (request.tools?.length) dto.tools = request.tools.map(toToolDto);
  if (request.toolChoice) dto.tool_choice = request.toolChoice;
  if (request.temperature != null) dto.temperature = request.temperature;
  return dto;
}

function mapFinishReason(value: string | null | undefined): AgentFinishReason {
  if (value === "tool_calls") return "tool_calls";
  if (value === "length") return "length";
  if (value === "error") return "error";
  return "stop";
}

export function toChatCompletionResult(
  dto: ChatCompletionResponseDto,
): ChatCompletionResult {
  if (dto.error?.message) {
    throw new Error(dto.error.message);
  }

  const choice = dto.choices?.[0];
  const raw = choice?.message;
  if (!raw) {
    throw new Error("AI connection returned no completion choices.");
  }

  const toolCalls = (raw.tool_calls ?? []).map((call) => ({
    id: call.id,
    name: call.function.name,
    argumentsJson: call.function.arguments ?? "{}",
  }));

  return {
    id: dto.id ?? createId(),
    finishReason: mapFinishReason(choice.finish_reason),
    message: createAgentMessage(
      "assistant",
      raw.content ?? "",
      toolCalls.length ? { toolCalls } : undefined,
    ),
  };
}
