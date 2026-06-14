import { describe, it, expect } from "vitest";
import { agentClient } from "./AgentClient";

describe("AgentClient (modo mock)", () => {
  it("está offline cuando no hay NEXT_PUBLIC_ENGINE_URL", () => {
    expect(agentClient.isOffline).toBe(true);
  });

  it("la respuesta de Productividad menciona agendar un evento", async () => {
    const res = await agentClient.sendMessage("productivity", "reunión el lunes");
    expect(res.success).toBe(true);
    expect(res.message).toContain("evento");
  });

  it("la respuesta de Entorno (clima) trae datos de weather", async () => {
    const res = await agentClient.getWeather("Antofagasta");
    expect(res.success).toBe(true);
    expect(res.data?.weather.city).toBe("Antofagasta");
  });

  it("healthCheck devuelve true en modo mock", async () => {
    expect(await agentClient.healthCheck()).toBe(true);
  });
});
