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

  // Load saved agent on mount.
  useEffect(() => {
    // Carga inicial desde localStorage: patrón intencional y seguro para
    // hidratación SSR (el servidor usa el default y el cliente rehidrata).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
