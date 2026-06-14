// =============================================================================
// manin-ia — Agent Client Service
// =============================================================================
// Handles all communication with the n8n backend engine.
// Currently uses mock responses for development.
// To connect to real backend: update ENGINE_BASE_URL in .env.local
// =============================================================================

import type { AgentResponse, AgentType, WeatherResponse } from "@/types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const ENGINE_BASE_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL || "https://n8n.yourdomain.com";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const MOCK_MODE = !process.env.NEXT_PUBLIC_ENGINE_URL;

// ---------------------------------------------------------------------------
// Mock Responses (Development)
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Agent Client
// ---------------------------------------------------------------------------
class AgentClient {
  private baseUrl: string;
  private apiKey: string;
  private isMock: boolean;

  constructor() {
    this.baseUrl = ENGINE_BASE_URL;
    this.apiKey = API_KEY;
    this.isMock = MOCK_MODE;
  }

  /**
   * Send a message to a specific agent and get a response.
   */
  async sendMessage(
    agentId: AgentType,
    message: string,
    context?: Record<string, unknown>
  ): Promise<AgentResponse> {
    if (this.isMock) {
      // Simulate network delay for realistic UX
      await delay(800 + Math.random() * 1200);
      return MOCK_RESPONSES[agentId](message);
    }

    const endpoint = this.getEndpoint(agentId);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey && { "X-API-Key": this.apiKey }),
        },
        body: JSON.stringify({
          message,
          timestamp: Date.now(),
          ...context,
        }),
        signal: AbortSignal.timeout(30000), // 30s timeout for LLM
      });

      if (!response.ok) {
        throw new Error(`Engine responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[AgentClient] Error calling ${agentId}:`, error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `❌ Error de conexión: ${error.message}`
            : "❌ Error de conexión con el Engine. Verifica que el servidor esté activo.",
      };
    }
  }

  /**
   * Get weather for a specific city.
   */
  async getWeather(city: string): Promise<WeatherResponse> {
    return this.sendMessage("weather", city, { city }) as Promise<WeatherResponse>;
  }

  /**
   * Check if the engine is reachable.
   */
  async healthCheck(): Promise<boolean> {
    if (this.isMock) return true;

    try {
      const response = await fetch(`${this.baseUrl}/healthz`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if we're running in mock mode.
   */
  get isOffline(): boolean {
    return this.isMock;
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------
  private getEndpoint(agentId: AgentType): string {
    const endpoints: Record<AgentType, string> = {
      productivity: "/webhook/agent-productivity",
      engram: "/webhook/agent-engram",
      weather: "/webhook/agent-weather",
    };
    return endpoints[agentId];
  }
}

// Singleton instance
export const agentClient = new AgentClient();
export default agentClient;
