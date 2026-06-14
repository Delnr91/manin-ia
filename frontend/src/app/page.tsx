"use client";

import BackgroundVideo from "@/components/BackgroundVideo";
import AgentSidebar from "@/components/AgentSidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { useAgent } from "@/hooks/useAgent";
import { useChat } from "@/hooks/useChat";
import { agentClient } from "@/services/AgentClient";

export default function Home() {
  const { activeAgent, setActiveAgent, currentAgent, agents } = useAgent();
  const { messages, isLoading, sendMessage } = useChat(activeAgent);

  // El AgentClient cae en modo mock si no hay NEXT_PUBLIC_ENGINE_URL.
  const offline = agentClient.isOffline;

  return (
    <>
      <BackgroundVideo />
      <div className="flex h-screen w-full">
        <AgentSidebar
          agents={agents}
          activeAgent={activeAgent}
          onSelect={setActiveAgent}
          busy={isLoading}
          offline={offline}
        />
        <ChatPanel
          agent={currentAgent}
          messages={messages}
          onSend={sendMessage}
          busy={isLoading}
          offline={offline}
        />
      </div>
    </>
  );
}
