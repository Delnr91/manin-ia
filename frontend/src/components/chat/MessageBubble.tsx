import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Agent, Message } from "@/types";
import { AgentIcon } from "@/components/icons";

/** Tres puntos animados mientras el agente "escribe". */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
      <span
        className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70"
        style={{ animationDelay: "0.2s" }}
      />
      <span
        className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70"
        style={{ animationDelay: "0.4s" }}
      />
    </span>
  );
}

export default function MessageBubble({
  message,
  agent,
}: {
  message: Message;
  agent: Agent;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={[
        "flex w-full animate-rise gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      {/* Avatar */}
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: isUser ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.4)",
          color: isUser ? "#e8eaf2" : agent.color,
        }}
      >
        {isUser ? (
          <span className="text-base">🧑‍🚀</span>
        ) : (
          <AgentIcon name={agent.icon} size={18} />
        )}
      </div>

      {/* Burbuja */}
      <div className={isUser ? "max-w-[78%] text-right" : "max-w-[78%]"}>
        {!isUser && (
          <span
            className="mb-1 block text-xs font-medium"
            style={{ color: agent.color }}
          >
            {agent.name}
          </span>
        )}
        <div
          className={[
            "inline-block rounded-2xl border px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm border-white/15 bg-white/10 text-white"
              : "rounded-tl-sm border-white/10 bg-black/30 text-white/90 backdrop-blur-md",
          ].join(" ")}
        >
          {message.isStreaming && !message.content ? (
            <TypingDots />
          ) : isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div className="md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
