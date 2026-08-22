"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IAgentService } from "@/core/domain/services/IAgentService";
import type { AgentMessage, AgentRunInput } from "@/core/domain/entities/AiAgent";

const AI_STATUS_QUERY_KEY = ["ai-helper", "status"];

function getAgentService(): IAgentService {
  return container.resolve<IAgentService>("agentService");
}

export function useAiHelperStatus(enabled = true) {
  return useQuery({
    queryKey: AI_STATUS_QUERY_KEY,
    queryFn: () => getAgentService().getConnectionStatus(),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useAiHelperTurn() {
  return useMutation({
    mutationFn: (input: AgentRunInput) => getAgentService().runTurn(input),
  });
}

export function visibleChatMessages(messages: AgentMessage[]): AgentMessage[] {
  return messages.filter(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      message.content.trim().length > 0,
  );
}
