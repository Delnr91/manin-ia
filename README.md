# 🪐 Manin-IA — La Granja de Saturno

Segundo cerebro **multi-agente, privado y gamificado**: un "JARVIS" donde cada
herramienta de IA es un agente con identidad propia, ambientado en un jardín
futurista en Saturno. El objetivo final es que el entorno (un jardín 3D vivo e
interactivo) sea parte de la experiencia, no un adorno.

> **Estado honesto (2026-06):** el proyecto está en sus cimientos. Hay una UI de
> chat real funcionando en **modo mock** (respuestas simuladas) y un backend
> (`engine/`) definido pero aún no cableado a la app. La IA real (Llama 3) y el
> jardín 3D todavía **no** están conectados. Ver [docs/ROADMAP.md](docs/ROADMAP.md)
> para el estado exacto fase por fase.

---

## Estructura del monorepo

```
manin-ia/
├── frontend/        # App Next.js 16 + React 19 + Tailwind v4 (el lienzo)
│   ├── src/app/         # Rutas (App Router)
│   ├── src/components/  # UI: sidebar de agentes, chat, fondo
│   ├── src/hooks/       # useAgent, useChat, useEngram
│   ├── src/services/    # AgentClient (habla con el Engine), storage (localStorage)
│   └── src/types/       # Tipos compartidos + catálogo de agentes
├── engine/          # Backend en la nube (el cerebro + las manos)
│   ├── docker-compose.yml   # Caddy (TLS) + n8n + Ollama
│   ├── caddy/Caddyfile
│   └── deploy.sh
└── docs/            # Plan maestro, arquitectura, engram, seguridad, testing
```

## Arrancar el frontend (local)

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Sin variables de entorno, la app corre en **modo mock**: el `AgentClient`
devuelve respuestas simuladas y lo indica claramente en la UI. Para conectar el
backend real, define en `frontend/.env.local`:

```
NEXT_PUBLIC_ENGINE_URL=https://n8n.tu-dominio.com
```

> ⚠️ Lee primero [docs/SECURITY.md](docs/SECURITY.md): `NEXT_PUBLIC_*` se
> **expone al navegador**. No metas secretos ahí.

## Comandos útiles (frontend)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint |
| `npm test` | Tests (Vitest) |

## Documentación

- 📍 [Plan maestro / Roadmap](docs/ROADMAP.md) — fases y estado real
- 🏛️ [Arquitectura](docs/ARCHITECTURE.md) — diseño, flujo de datos, decisiones
- 🧠 [Engram](docs/ENGRAM.md) — registro de conocimiento y decisiones
- 🔒 [Seguridad](docs/SECURITY.md) — baseline y pendientes
- 🧪 [Testing](docs/TESTING.md) — estrategia de pruebas
