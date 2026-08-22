import type {
  AgentRunInput,
  AgentRunResult,
  AiConnectionStatus,
  PosHelperAgent,
} from "@/core/domain/entities/AiAgent";

export interface IAgentService {
  getAgent(): PosHelperAgent;
  getConnectionStatus(): Promise<AiConnectionStatus>;
  runTurn(input: AgentRunInput): Promise<AgentRunResult>;
}
