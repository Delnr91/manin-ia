// =============================================================================
// manin-ia — Shared TypeScript Types
// =============================================================================

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------
export type AgentType = "productivity" | "engram" | "weather";

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  endpoint: string; // n8n webhook path
  color: string; // Accent color for UI
}

export const AGENTS: Agent[] = [
  {
    id: "productivity",
    name: "Productividad",
    description: "Agenda reuniones, crea recordatorios y gestiona tu calendario",
    icon: "Calendar",
    endpoint: "/webhook/agent-productivity",
    color: "#00d4ff",
  },
  {
    id: "engram",
    name: "Contexto",
    description: "Resume tu jornada y gestiona tus engramas de conocimiento",
    icon: "Brain",
    endpoint: "/webhook/agent-engram",
    color: "#a855f7",
  },
  {
    id: "weather",
    name: "Entorno",
    description: "Consulta el clima y recibe consejos personalizados",
    icon: "CloudSun",
    endpoint: "/webhook/agent-weather",
    color: "#22c55e",
  },
];

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  agentId: AgentType;
  isStreaming?: boolean;
}

// ---------------------------------------------------------------------------
// Engramas (Markdown Notes)
// ---------------------------------------------------------------------------
export interface Engram {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface EngramMeta {
  id: string;
  title: string;
  updatedAt: number;
  preview: string; // First ~100 chars
}

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------
export interface AgentResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface WeatherData {
  city: string;
  tempC: string;
  feelsLikeC: string;
  humidity: string;
  description: string;
  uvIndex: string;
  windKmph: string;
  advice: string;
}

export interface WeatherResponse extends AgentResponse {
  data?: {
    weather: WeatherData;
  };
}

// ---------------------------------------------------------------------------
// App State
// ---------------------------------------------------------------------------
export interface AppState {
  activeAgent: AgentType;
  isSidebarOpen: boolean;
  isEngramPanelOpen: boolean;
  isMobile: boolean;
}
