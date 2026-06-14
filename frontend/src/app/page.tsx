"use client";

import dynamic from "next/dynamic";
import AgentSidebar from "@/components/AgentSidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { useAgent } from "@/hooks/useAgent";
import { useChat } from "@/hooks/useChat";
import { agentClient } from "@/services/AgentClient";

// La escena 3D (WebGL) solo corre en el cliente → carga dinámica sin SSR.
const SaturnGarden = dynamic(() => import("@/components/garden/SaturnGarden"), {
  ssr: false,
});

export default function Home() {
  const { activeAgent, setActiveAgent, currentAgent, agents } = useAgent();
  const { messages, isLoading, sendMessage } = useChat(activeAgent);

  // El AgentClient cae en modo mock si no hay NEXT_PUBLIC_ENGINE_URL.
  const offline = agentClient.isOffline;

  return (
    <>
      <SaturnGarden />
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
