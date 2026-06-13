// =============================================================================
// manin-ia — Local Storage Manager
// =============================================================================
// Handles persistent storage for engramas and chat history using localStorage.
// Provides a clean API with automatic JSON serialization.
// =============================================================================

import type { Engram, EngramMeta, Message, AgentType } from "@/types";

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
const KEYS = {
  ENGRAMS: "manin-ia:engrams",
  CHAT_PREFIX: "manin-ia:chat:",
  ACTIVE_AGENT: "manin-ia:active-agent",
  SETTINGS: "manin-ia:settings",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("[storage] Failed to write:", key, e);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Engram Storage
// ---------------------------------------------------------------------------
export const engramStorage = {
  /** Get all engramas, sorted by most recently updated */
  getAll(): Engram[] {
    return safeGet<Engram[]>(KEYS.ENGRAMS, []).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  },

  /** Get metadata only (for sidebar listing) */
  listMeta(): EngramMeta[] {
    return this.getAll().map((e) => ({
      id: e.id,
      title: e.title,
      updatedAt: e.updatedAt,
      preview: e.content.slice(0, 100).replace(/\n/g, " "),
    }));
  },

  /** Get a single engram by ID */
  get(id: string): Engram | null {
    const all = this.getAll();
    return all.find((e) => e.id === id) ?? null;
  },

  /** Create a new engram */
  create(title: string, content: string = "", tags: string[] = []): Engram {
    const now = Date.now();
    const engram: Engram = {
      id: generateId(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      tags,
    };
    const all = this.getAll();
    all.push(engram);
    safeSet(KEYS.ENGRAMS, all);
    return engram;
  },

  /** Update an existing engram (partial update) */
  update(id: string, updates: Partial<Pick<Engram, "title" | "content" | "tags">>): Engram | null {
    const all = this.getAll();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      ...updates,
      updatedAt: Date.now(),
    };
    safeSet(KEYS.ENGRAMS, all);
    return all[index];
  },

  /** Delete an engram */
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((e) => e.id !== id);
    if (filtered.length === all.length) return false;
    safeSet(KEYS.ENGRAMS, filtered);
    return true;
  },
};

// ---------------------------------------------------------------------------
// Chat History Storage
// ---------------------------------------------------------------------------
export const chatStorage = {
  /** Get chat history for an agent */
  getMessages(agentId: AgentType): Message[] {
    return safeGet<Message[]>(`${KEYS.CHAT_PREFIX}${agentId}`, []);
  },

  /** Save chat history for an agent */
  saveMessages(agentId: AgentType, messages: Message[]): void {
    // Keep only last 100 messages per agent to prevent storage bloat
    const trimmed = messages.slice(-100);
    safeSet(`${KEYS.CHAT_PREFIX}${agentId}`, trimmed);
  },

  /** Add a single message to an agent's chat */
  addMessage(agentId: AgentType, message: Message): void {
    const messages = this.getMessages(agentId);
    messages.push(message);
    this.saveMessages(agentId, messages);
  },

  /** Clear chat history for an agent */
  clear(agentId: AgentType): void {
    safeSet(`${KEYS.CHAT_PREFIX}${agentId}`, []);
  },

  /** Clear all chat history */
  clearAll(): void {
    if (typeof window === "undefined") return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(KEYS.CHAT_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

// ---------------------------------------------------------------------------
// Settings Storage
// ---------------------------------------------------------------------------
export const settingsStorage = {
  getActiveAgent(): AgentType {
    return safeGet<AgentType>(KEYS.ACTIVE_AGENT, "productivity");
  },

  setActiveAgent(agentId: AgentType): void {
    safeSet(KEYS.ACTIVE_AGENT, agentId);
  },
};
