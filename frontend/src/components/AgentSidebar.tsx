"use client";

import type { Agent, AgentType } from "@/types";
import { AgentIcon } from "./icons";

interface AgentSidebarProps {
  agents: Agent[];
  activeAgent: AgentType;
  onSelect: (id: AgentType) => void;
  /** true mientras el agente activo procesa una respuesta. */
  busy?: boolean;
  offline?: boolean;
}

export default function AgentSidebar({
  agents,
  activeAgent,
  onSelect,
  busy,
  offline,
}: AgentSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 border-r border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <header className="px-2 pt-2">
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="text-xl">🪐</span> Manin-IA
        </h1>
        <p className="mt-0.5 text-xs text-white/50">La Granja de Saturno</p>
      </header>

      <nav className="flex flex-col gap-2">
        {agents.map((agent) => {
          const selected = agent.id === activeAgent;
          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              aria-pressed={selected}
              className={[
                "group relative flex items-center gap-3 rounded-xl border p-3 text-left transition",
                selected
                  ? "border-white/25 bg-white/10 shadow-lg"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5",
              ].join(" ")}
              style={
                selected
                  ? { boxShadow: `0 8px 30px -10px ${agent.color}66` }
                  : undefined
              }
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-black/30"
                style={{ color: agent.color }}
              >
                <AgentIcon name={agent.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {agent.name}
                  </span>
                  <span
                    className={[
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      selected && busy ? "animate-pulse" : "",
                    ].join(" ")}
                    style={{
                      backgroundColor:
                        selected && busy ? agent.color : "rgba(255,255,255,0.25)",
                    }}
                  />
                </span>
                <span className="mt-0.5 block truncate text-xs text-white/50">
                  {agent.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <footer className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/45">
        {offline ? (
          <>
            <span className="font-medium text-amber-300/80">Modo mock.</span>{" "}
            El Engine (n8n/Ollama) no está conectado: las respuestas son
            simuladas. Configura{" "}
            <code className="text-white/60">NEXT_PUBLIC_ENGINE_URL</code>.
          </>
        ) : (
          <>
            <span className="font-medium text-emerald-300/80">
              Engine conectado.
            </span>{" "}
            Las respuestas vienen de tu backend real.
          </>
        )}
      </footer>
    </aside>
  );
}
