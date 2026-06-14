// =============================================================================
// manin-ia — Agent Client Service
// =============================================================================
// El cliente habla con el proxy interno (/api/agent/:id), que del lado servidor
// reenvía al Engine (n8n). Si el Engine no está conectado, cae en modo mock.
// =============================================================================

import type { AgentResponse, AgentType, WeatherResponse } from "@/types";

// Si NEXT_PUBLIC_ENGINE_CONNECTED !== "true", la app corre en modo simulado.
const MOCK_MODE = process.env.NEXT_PUBLIC_ENGINE_CONNECTED !== "true";

// ---------------------------------------------------------------------------
// Mock Responses (cuando no hay Engine conectado)
// ---------------------------------------------------------------------------
const MOCK_RESPONSES: Record<AgentType, (msg: string) => AgentResponse> = {
  productivity: (msg: string) => ({
    success: true,
    message: `📅 Entendido. He analizado tu mensaje: "${msg.slice(0, 50)}..."\n\nDetecté la intención de **agendar un evento**. En modo producción, esto crearía automáticamente un evento en tu Google Calendar.\n\n_Conecta el Engine para activar esta función._`,
  }),
  engram: (msg: string) => ({
    success: true,
    message: `🧠 **Engrama registrado.**\n\nHe procesado tu nota y extraído los puntos clave:\n\n- Contexto capturado: ${msg.slice(0, 80)}...\n- Timestamp: ${new Date().toLocaleString("es-CL")}\n\nEn modo producción, esto se sincronizaría con tu servidor de engramas.`,
  }),
  weather: () => ({
    success: true,
    message: `🌤️ **Clima actual — Antofagasta**\n\n- Temperatura: 18°C (sensación 16°C)\n- Humedad: 72%\n- Viento: 15 km/h SO\n- UV: 3 (moderado)\n\n💡 *Consejo: Lleva una chaqueta ligera. La brisa costera puede sentirse fresca al atardecer.*\n\n_Conecta el Engine para datos en tiempo real via wttr.in._`,
    data: {
      weather: {
        city: "Antofagasta",
        tempC: "18",
        feelsLikeC: "16",
        humidity: "72",
        description: "Parcialmente nublado",
        uvIndex: "3",
        windKmph: "15",
        advice: "Lleva una chaqueta ligera.",
      },
    },
  }),
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Agent Client
// ---------------------------------------------------------------------------
class AgentClient {
  private isMock = MOCK_MODE;

  /**
   * Envía un mensaje a un agente. En modo real llama al proxy /api/agent/:id,
   * que reenvía al Engine (n8n → Ollama). En modo mock responde simulado.
   */
  async sendMessage(agentId: AgentType, message: string): Promise<AgentResponse> {
    if (this.isMock) {
      await delay(700 + Math.random() * 800);
      return MOCK_RESPONSES[agentId](message);
    }

    try {
      const res = await fetch(`/api/agent/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      return (await res.json()) as AgentResponse;
    } catch {
      return {
        success: false,
        message:
          "❌ Error de conexión con el agente. Verifica que la app y el Engine estén activos.",
      };
    }
  }

  /** Atajo para el agente del clima. */
  async getWeather(city: string): Promise<WeatherResponse> {
    return this.sendMessage("weather", city) as Promise<WeatherResponse>;
  }

  /** ¿Estamos en modo mock (sin Engine)? */
  get isOffline(): boolean {
    return this.isMock;
  }
}

// Singleton instance
export const agentClient = new AgentClient();
export default agentClient;
