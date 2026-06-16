import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "./MessageBubble";
import { AGENTS } from "@/types";
import type { Message } from "@/types";

const agent = AGENTS[0];

function make(content: string, role: "user" | "assistant"): Message {
  return { id: "1", role, content, timestamp: 0, agentId: "productivity" };
}

describe("<MessageBubble />", () => {
  it("renderiza Markdown (negrita y lista) en mensajes del agente", () => {
    render(
      <MessageBubble
        message={make("Hola **mundo**\n\n- uno\n- dos", "assistant")}
        agent={agent}
      />,
    );
    expect(screen.getByText("mundo").tagName).toBe("STRONG");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("muestra los mensajes del usuario como texto plano (sin parsear Markdown)", () => {
    render(<MessageBubble message={make("**no** parsear", "user")} agent={agent} />);
    expect(screen.getByText("**no** parsear")).toBeInTheDocument();
  });

  it("muestra el nombre del agente en sus mensajes", () => {
    render(<MessageBubble message={make("hola", "assistant")} agent={agent} />);
    expect(screen.getByText(agent.name)).toBeInTheDocument();
  });
});
