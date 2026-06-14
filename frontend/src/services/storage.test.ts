import { describe, it, expect } from "vitest";
import { engramStorage, chatStorage } from "./storage";
import type { Message } from "@/types";

describe("engramStorage", () => {
  it("crea y recupera un engrama", () => {
    const created = engramStorage.create("Mi nota", "contenido inicial", ["x"]);
    expect(created.id).toBeTruthy();
    expect(created.title).toBe("Mi nota");

    const fetched = engramStorage.get(created.id);
    expect(fetched?.content).toBe("contenido inicial");
    expect(fetched?.tags).toEqual(["x"]);
  });

  it("actualiza el contenido y refresca updatedAt", async () => {
    const e = engramStorage.create("Editable");
    const before = e.updatedAt;
    await new Promise((r) => setTimeout(r, 2));

    const updated = engramStorage.update(e.id, { content: "nuevo" });
    expect(updated?.content).toBe("nuevo");
    expect(updated!.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it("lista metadatos ordenados por más reciente", async () => {
    engramStorage.create("Primero");
    // Espera >1ms para que updatedAt difiera (la ordenación es por timestamp).
    await new Promise((r) => setTimeout(r, 3));
    const segundo = engramStorage.create("Segundo");
    const meta = engramStorage.listMeta();
    expect(meta[0].id).toBe(segundo.id); // el más reciente primero
    expect(meta).toHaveLength(2);
  });

  it("elimina un engrama", () => {
    const e = engramStorage.create("Borrable");
    expect(engramStorage.delete(e.id)).toBe(true);
    expect(engramStorage.get(e.id)).toBeNull();
  });
});

describe("chatStorage", () => {
  const msg = (content: string): Message => ({
    id: `${Math.random()}`,
    role: "user",
    content,
    timestamp: Date.now(),
    agentId: "productivity",
  });

  it("guarda y recupera mensajes por agente", () => {
    chatStorage.saveMessages("productivity", [msg("hola"), msg("mundo")]);
    const got = chatStorage.getMessages("productivity");
    expect(got).toHaveLength(2);
    expect(got[0].content).toBe("hola");
  });

  it("aísla el historial entre agentes", () => {
    chatStorage.saveMessages("productivity", [msg("para productividad")]);
    expect(chatStorage.getMessages("weather")).toHaveLength(0);
  });

  it("recorta a los últimos 100 mensajes", () => {
    const many = Array.from({ length: 120 }, (_, i) => msg(`m${i}`));
    chatStorage.saveMessages("engram", many);
    const got = chatStorage.getMessages("engram");
    expect(got).toHaveLength(100);
    expect(got[0].content).toBe("m20"); // se descartaron los 20 primeros
  });
});
