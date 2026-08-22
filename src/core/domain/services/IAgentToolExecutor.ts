import type { AgentTool } from "@/core/domain/entities/AiAgent";

export interface IAgentToolExecutor {
  listTools(): AgentTool[];
  execute(name: string, argumentsJson: string): Promise<string>;
}
