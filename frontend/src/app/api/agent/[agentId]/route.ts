import { NextResponse } from "next/server";
import { buildAgentPrompt } from "@/lib/personas";

// =============================================================================
// Proxy de agentes — el navegador llama AQUÍ (mismo origen), y esta ruta
// reenvía al Engine (n8n) del lado servidor. Así evitamos CORS, mixed-content
// y exponer la URL del backend al cliente.
// =============================================================================

// Permite respuestas lentas de Ollama en CPU (la primera carga tarda).
export const maxDuration = 120;

const ENGINE_URL = process.env.ENGINE_URL;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;

  let message = "";
  try {
    const body = await request.json();
    message = typeof body?.message === "string" ? body.message : "";
  } catch {
    return NextResponse.json(
      { success: false, message: "Cuerpo de petición inválido." },
      { status: 400 },
    );
  }

  // Sin Engine configurado → respuesta simulada (no rompe la app).
  if (!ENGINE_URL) {
    return NextResponse.json({
      success: true,
      message: `(Modo mock) No hay ENGINE_URL configurado. Recibí: "${message}".`,
    });
  }

  try {
    const res = await fetch(`${ENGINE_URL}/webhook/agent-${agentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Anteponemos la persona del agente al mensaje del usuario.
      body: JSON.stringify({ message: buildAgentPrompt(agentId, message) }),
      // Ollama en CPU puede tardar bastante; damos margen amplio.
      signal: AbortSignal.timeout(115_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `El agente "${agentId}" respondió ${res.status}. ¿Existe y está activo su workflow en n8n?`,
        },
        { status: 502 },
      );
    }

    const data = await res.json();
    // n8n ("First Incoming Item") devuelve { content: "..." }. Toleramos variantes.
    const text =
      data?.content ??
      data?.message ??
      (typeof data === "string" ? data : JSON.stringify(data));

    return NextResponse.json({ success: true, message: text });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? "El agente tardó demasiado (Ollama en CPU puede ser lento). Intenta de nuevo."
          : "No pude conectar con el agente. ¿Está encendida la VM y activo el workflow?",
      },
      { status: 504 },
    );
  }
}
