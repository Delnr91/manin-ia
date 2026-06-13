"use client";
// =============================================================================
// useAgent — Agent Selection Hook
// =============================================================================

import { useState, useCallback, useEffect } from "react";
import type { AgentType, Agent } from "@/types";
import { AGENTS } from "@/types";
import { settingsStorage } from "@/services/storage";

export function useAgent() {
  const [activeAgent, setActiveAgentState] = useState<AgentType>("productivity");

  // Load saved agent on mount
  useEffect(() => {
    setActiveAgentState(settingsStorage.getActiveAgent());
  }, []);

  const setActiveAgent = useCallback((agentId: AgentType) => {
    setActiveAgentState(agentId);
    settingsStorage.setActiveAgent(agentId);
  }, []);

  const currentAgent: Agent = AGENTS.find((a) => a.id === activeAgent) ?? AGENTS[0];

  return {
    activeAgent,
    setActiveAgent,
    currentAgent,
    agents: AGENTS,
  };
}
