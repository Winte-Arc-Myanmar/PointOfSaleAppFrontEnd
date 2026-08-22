import type {
  AgentRunInput,
  AgentRunResult,
  AiConnectionStatus,
  PosHelperAgent,
} from "@/core/domain/entities/AiAgent";
import {
  POS_HELPER_AGENT_ID,
  POS_HELPER_INSTRUCTIONS,
  POS_HELPER_MODEL,
} from "@/core/domain/entities/AiAgent";
import type { IAiConnection } from "@/core/domain/repositories/IAiConnection";
import type { IAgentService } from "@/core/domain/services/IAgentService";
import type { IAgentToolExecutor } from "@/core/domain/services/IAgentToolExecutor";
import { createAgentMessage } from "@/core/application/mappers/AiChatMapper";

const MAX_TOOL_ROUNDS = 4;

export class AgentService implements IAgentService {
  constructor(
    private readonly connection: IAiConnection,
    private readonly tools: IAgentToolExecutor,
  ) {}

  getAgent(): PosHelperAgent {
    return {
      id: POS_HELPER_AGENT_ID,
      name: "Loli",
      instructions: POS_HELPER_INSTRUCTIONS,
      model: POS_HELPER_MODEL,
      tools: this.tools.listTools(),
    };
  }

  getConnectionStatus(): Promise<AiConnectionStatus> {
    return this.connection.getStatus();
  }

  async runTurn(input: AgentRunInput): Promise<AgentRunResult> {
    const connection = await this.connection.getStatus();
    const userMessage = createAgentMessage("user", input.userContent.trim());
    const history = [...input.messages, userMessage];

    if (!userMessage.content) {
      return {
        messages: input.messages,
        status: "failed",
        finishReason: "error",
        connection,
      };
    }

    if (connection.state !== "ready") {
      return {
        messages: [
          ...history,
          createAgentMessage("assistant", unavailableMessage(connection)),
        ],
        status: "completed",
        finishReason: "connection_unavailable",
        connection,
      };
    }

    const agent = this.getAgent();
    let working = withSystemPrompt(history, agent.instructions);

    try {
      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const completion = await this.connection.complete({
          model: agent.model,
          messages: working,
          tools: agent.tools,
          toolChoice: "auto",
        });

        working = [...working, completion.message];

        const toolCalls = completion.message.toolCalls ?? [];
        if (toolCalls.length === 0) {
          return {
            messages: withoutSystem(working),
            status: "completed",
            finishReason: completion.finishReason,
            connection,
          };
        }

        for (const call of toolCalls) {
          const output = await this.tools.execute(call.name, call.argumentsJson);
          working = [
            ...working,
            createAgentMessage("tool", output, { toolCallId: call.id }),
          ];
        }
      }

      return {
        messages: withoutSystem(working),
        status: "completed",
        finishReason: "tool_calls",
        connection,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The AI helper could not complete this turn.";
      return {
        messages: [...history, createAgentMessage("assistant", message)],
        status: "failed",
        finishReason: "error",
        connection,
      };
    }
  }
}

function withSystemPrompt(
  messages: AgentRunInput["messages"],
  instructions: string,
) {
  const hasSystem = messages.some((message) => message.role === "system");
  if (hasSystem) return messages;
  return [createAgentMessage("system", instructions), ...messages];
}

function withoutSystem(messages: AgentRunInput["messages"]) {
  return messages.filter((message) => message.role !== "system");
}

function unavailableMessage(status: AiConnectionStatus): string {
  return [
    "Loli is ready, but the AI connection is not configured yet.",
    status.message,
    "When the backend adds POST /v1/ai/chat/completions (OpenAI-compatible) and GET /v1/ai/status, this chat will run the full tool loop.",
  ].join(" ");
}
