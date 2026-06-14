"use client";
// =============================================================================
// useChat — Chat State Management Hook
// =============================================================================

import { useState, useCallback, useEffect } from "react";
import type { Message, AgentType } from "@/types";
import { chatStorage } from "@/services/storage";
import { agentClient } from "@/services/AgentClient";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat(agentId: AgentType) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history when agent changes.
  useEffect(() => {
    const saved = chatStorage.getMessages(agentId);
    // Carga inicial desde localStorage: patrón intencional y seguro para
    // hidratación SSR (el servidor renderiza [] y el cliente rehidrata).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(saved);
  }, [agentId]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      chatStorage.saveMessages(agentId, messages);
    }
  }, [messages, agentId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
        agentId,
      };

      // Add placeholder for assistant response
      const assistantId = generateId();
      const placeholderMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        agentId,
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, placeholderMsg]);
      setIsLoading(true);

      try {
        const response = await agentClient.sendMessage(agentId, content);

        // Update placeholder with real response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: response.message,
                  isStreaming: false,
                  timestamp: Date.now(),
                }
              : msg
          )
        );
      } catch {
        // Update placeholder with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content:
                    "❌ No pude conectar con el Engine. Verifica que el servidor esté activo.",
                  isStreaming: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [agentId, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    chatStorage.clear(agentId);
  }, [agentId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
