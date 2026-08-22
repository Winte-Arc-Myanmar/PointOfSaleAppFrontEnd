/**
 * Standard agentic types (OpenAI-compatible chat + tool calling).
 * Domain layer — no provider or framework details.
 */

export type AgentMessageRole = "system" | "user" | "assistant" | "tool";

export type AgentRunStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentFinishReason =
  | "stop"
  | "tool_calls"
  | "length"
  | "connection_unavailable"
  | "error";

export type AiConnectionState = "not_configured" | "ready" | "error";

export interface AgentToolCall {
  id: string;
  name: string;
  argumentsJson: string;
}

export interface AgentMessage {
  id: string;
  role: AgentMessageRole;
  content: string;
  toolCallId?: string;
  toolCalls?: AgentToolCall[];
  createdAt: string;
}

export interface AgentToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AgentTool {
  type: "function";
  function: AgentToolFunction;
}

export interface PosHelperAgent {
  id: string;
  name: string;
  instructions: string;
  model: string;
  tools: AgentTool[];
}

export interface AiConnectionStatus {
  state: AiConnectionState;
  provider?: string;
  model?: string;
  message: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: AgentMessage[];
  tools?: AgentTool[];
  toolChoice?: "auto" | "none";
  temperature?: number;
}

export interface ChatCompletionResult {
  id: string;
  message: AgentMessage;
  finishReason: AgentFinishReason;
}

export interface AgentRunInput {
  messages: AgentMessage[];
  userContent: string;
}

export interface AgentRunResult {
  messages: AgentMessage[];
  status: AgentRunStatus;
  finishReason: AgentFinishReason;
  connection: AiConnectionStatus;
}

export const POS_HELPER_AGENT_ID = "pos-helper";
export const POS_HELPER_MODEL = "pos-helper";

export const POS_HELPER_INSTRUCTIONS = [
  "You are Loli, a friendly customer service agent for Winterarc POS staff and managers.",
  "Answer questions about using this point-of-sale app: checkout, orders, inventory, purchasing, users, and reports.",
  "Use tools when you need module routes or how-to steps.",
  "Do not invent stock levels, prices, customer records, or permissions.",
  "If a request needs live data from the backend, say so and point the user to the matching screen.",
].join(" ");
