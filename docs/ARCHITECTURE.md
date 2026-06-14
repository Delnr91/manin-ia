# 🏛️ Arquitectura — Manin-IA

## Visión de alto nivel

```
┌──────────────────────────────────────────────────────────────┐
│  NAVEGADOR                                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ frontend/ (Next.js 16, React 19, Tailwind v4)          │  │
│  │                                                        │  │
│  │  page.tsx ──> useAgent()      (agente activo)          │  │
│  │           └─> useChat(agentId)(historial + envío)      │  │
│  │                    │                                   │  │
│  │                    ▼                                   │  │
│  │             AgentClient ──(mock | fetch)──┐            │  │
│  │             storage (localStorage)        │            │  │
│  └───────────────────────────────────────────┼───────────┘  │
└──────────────────────────────────────────────┼──────────────┘
                                                │ HTTPS (webhook)
                                                ▼
┌──────────────────────────────────────────────────────────────┐
│  GOOGLE CLOUD — engine/                                        │
│   Caddy (TLS, reverse proxy)                                   │
│     ├─> n8n   (workflows / orquestación de herramientas)       │
│     └─> Ollama (Llama 3, inferencia LLM)                       │
└──────────────────────────────────────────────────────────────┘
```

El **frontend** es el lienzo; el **engine** es el cerebro (Ollama) y las manos
(n8n). Hoy el frontend funciona en **modo mock** y aún no llama al engine.

## Capas del frontend

| Capa | Archivos | Responsabilidad |
|---|---|---|
| **Presentación** | `app/page.tsx`, `components/*` | UI pura; no conoce la red |
| **Estado** | `hooks/useAgent`, `useChat`, `useEngram` | Estado de React + persistencia |
| **Servicios** | `services/AgentClient`, `services/storage` | Frontera con el exterior (HTTP / localStorage) |
| **Dominio** | `types/index.ts` | Tipos y catálogo de agentes (`AGENTS`) |

**Regla de dependencia:** Presentación → Estado → Servicios → Dominio. La UI
nunca hace `fetch` directo; siempre pasa por un servicio. Esto permite el modo
mock y, mañana, testear sin red.

## Patrones de diseño en uso

- **Adapter / Gateway:** `AgentClient` aísla el backend. Cambiar de mock a real
  es una variable de entorno, no un cambio de UI.
- **Repository:** `storage.ts` (`engramStorage`, `chatStorage`, `settingsStorage`)
  encapsula localStorage con una API limpia y serialización segura para SSR.
- **Custom hooks como casos de uso:** cada hook expone una intención
  (`sendMessage`, `createEngram`) en vez de estado crudo.
- **Config por datos:** los agentes viven en `AGENTS` (un array de datos), no en
  código duplicado. Añadir un agente = añadir un objeto.

## Flujo de un mensaje (hoy)

1. El usuario escribe → `ChatInput.onSend`.
2. `useChat.sendMessage` añade el mensaje del usuario + un placeholder
   `isStreaming`.
3. Llama a `agentClient.sendMessage(agentId, texto)`.
4. **Mock:** espera ~1s y devuelve una respuesta simulada por agente.
   **Real (futuro):** `POST` al webhook de n8n correspondiente.
5. El placeholder se reemplaza con la respuesta; se persiste en localStorage.

## Decisiones de arquitectura (ADR)

Las decisiones con su justificación viven en [ENGRAM.md](ENGRAM.md). Resumen:

- **ADR-001:** Monorepo `frontend/` + `engine/`.
- **ADR-002:** Todo TypeScript (no servicio Python para LangGraph).
- **ADR-003:** GitHub como fuente única de verdad.
- **ADR-004:** Jardín 3D con React Three Fiber (no PixiJS 2.5D).
- **ADR-005:** Streaming por SSE para el LLM.

## Deuda técnica conocida

- `NEXT_PUBLIC_API_KEY` se expone al navegador (ver [SECURITY.md](SECURITY.md)).
- El video de fondo (~5MB en bucle) es pesado; se reemplazará por el jardín 3D.
- No hay capa de API en Next.js todavía (Fase 2 la introduce como proxy/SSE).
