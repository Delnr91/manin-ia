"use client";

import { useEffect, useRef } from "react";
import type { Agent, Message } from "@/types";
import { AgentIcon } from "@/components/icons";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatPanelProps {
  agent: Agent;
  messages: Message[];
  onSend: (text: string) => void;
  busy?: boolean;
  offline?: boolean;
}

export default function ChatPanel({
  agent,
  messages,
  onSend,
  busy,
  offline,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="flex flex-1 flex-col">
      {/* Cabecera del agente activo */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
        <span
          className="grid h-10 w-10 place-items-center rounded-lg bg-black/30"
          style={{ color: agent.color }}
        >
          <AgentIcon name={agent.icon} size={20} />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{agent.name}</h2>
          <p className="text-xs text-white/50">{agent.description}</p>
        </div>
      </header>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
          {messages.length === 0 ? (
            <EmptyState agent={agent} offline={offline} />
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} message={m} agent={agent} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Entrada */}
      <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-2xl">
          <ChatInput
            onSend={onSend}
            disabled={busy}
            accent={agent.color}
            placeholder={`Habla con ${agent.name}…`}
          />
          <p className="mt-2 text-center text-[11px] text-white/35">
            {offline
              ? "Modo mock · sin Engine conectado. Configura NEXT_PUBLIC_ENGINE_URL para IA real."
              : "Conectado al Engine."}
          </p>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ agent, offline }: { agent: Agent; offline?: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl bg-black/30"
        style={{ color: agent.color }}
      >
        <AgentIcon name={agent.icon} size={28} />
      </span>
      <h3 className="text-base font-medium">{agent.name}</h3>
      <p className="max-w-sm text-sm text-white/50">{agent.description}</p>
      {offline && (
        <p className="max-w-sm text-xs text-amber-300/60">
          Estás en modo mock: las respuestas son simuladas hasta conectar el
          Engine.
        </p>
      )}
    </div>
  );
}
