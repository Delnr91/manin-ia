import { describe, it, expect } from "vitest";
import { buildAgentPrompt } from "./personas";

describe("buildAgentPrompt", () => {
  it("incluye la persona del agente y el mensaje del usuario", () => {
    const prompt = buildAgentPrompt("productivity", "¿qué hago hoy?");
    expect(prompt).toContain("Productividad");
    expect(prompt).toContain("¿qué hago hoy?");
  });

  it("usa una persona por defecto para un id desconocido", () => {
    const prompt = buildAgentPrompt("desconocido", "hola");
    expect(prompt).toContain("asistente");
    expect(prompt).toContain("hola");
  });

  it("da personas distintas a agentes distintos", () => {
    const a = buildAgentPrompt("productivity", "x");
    const b = buildAgentPrompt("engram", "x");
    expect(a).not.toBe(b);
  });
});
