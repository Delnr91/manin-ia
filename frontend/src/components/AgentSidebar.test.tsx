import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AgentSidebar from "./AgentSidebar";
import { AGENTS } from "@/types";

describe("<AgentSidebar />", () => {
  it("renderiza los tres agentes", () => {
    render(
      <AgentSidebar
        agents={AGENTS}
        activeAgent="productivity"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Productividad")).toBeInTheDocument();
    expect(screen.getByText("Contexto")).toBeInTheDocument();
    expect(screen.getByText("Entorno")).toBeInTheDocument();
  });

  it("marca como activo el agente seleccionado", () => {
    render(
      <AgentSidebar agents={AGENTS} activeAgent="weather" onSelect={() => {}} />,
    );
    const entorno = screen.getByText("Entorno").closest("button");
    expect(entorno).toHaveAttribute("aria-pressed", "true");
  });

  it("llama onSelect con el id del agente al hacer clic", () => {
    const onSelect = vi.fn();
    render(
      <AgentSidebar
        agents={AGENTS}
        activeAgent="productivity"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("Contexto"));
    expect(onSelect).toHaveBeenCalledWith("engram");
  });

  it("muestra el aviso de modo mock cuando offline", () => {
    render(
      <AgentSidebar
        agents={AGENTS}
        activeAgent="productivity"
        onSelect={() => {}}
        offline
      />,
    );
    expect(screen.getByText(/Modo mock/i)).toBeInTheDocument();
  });
});
