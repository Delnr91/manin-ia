# 🧠 Engram — Registro de conocimiento y decisiones

El "engram" es la memoria del proyecto: por qué las cosas son como son. Si una
decisión cambia, se actualiza aquí (no se borra el historial; se anota la nueva).

---

## Decisiones (ADR)

### D-001 · Monorepo `frontend/` + `engine/`
**Contexto:** la app (Next.js) y el backend (Caddy + n8n + Ollama) son piezas
distintas pero acopladas.
**Decisión:** un solo repo con dos carpetas de nivel superior.
**Por qué:** despliegues y versiones coordinados, una sola fuente de verdad, sin
sincronizar dos repos.

### D-002 · Todo TypeScript (sin servicio Python para LangGraph)
**Contexto:** LangGraph es más maduro en Python; el frontend obliga a JS/TS.
**Decisión:** un único lenguaje, TypeScript, usando `@langchain/langgraph` (JS)
cuando llegue la orquestación (Fase 3).
**Por qué:** el proyecto lo lleva una persona; **simplicidad > tener la versión
más avanzada de LangGraph**. Un runtime, un `npm install`, menos cosas que se
rompen. Se reconsiderará solo si se necesita una feature exclusiva de Python.

### D-003 · GitHub como fuente única de verdad
**Contexto:** existía trabajo real en GitHub (rama `push-to-github-remote`) que
**no estaba en la copia local**; en paralelo se había construido un scaffold
local duplicado e inferior.
**Decisión:** consolidar todo en GitHub; lo local es un espejo desechable. El
trabajo se unificó en la rama `unified`.
**Por qué:** evita divergencia y duplicados. **Aprendizaje:** antes de declarar
"el repo está vacío", revisar `git ls-remote` y **todas** las ramas, no solo el
estado local.

### D-004 · Jardín 3D con React Three Fiber (no PixiJS 2.5D)
**Contexto:** el documento original proponía una "granja" isométrica 2.5D con
PixiJS y sprites. La visión real es un **jardín de Saturno vivo**: flores 3D
transparentes (orquídeas-tigre) que reaccionan — el entorno **es** la narrativa.
**Decisión:** usar **Three.js / React Three Fiber** (WebGL 3D), no PixiJS ni un
video plano.
**Por qué:** flores 3D interactivas y translúcidas requieren 3D real. El `.mp4`
actual es solo un placeholder hasta la Fase 4.

### D-005 · Streaming por SSE
**Decisión:** usar Server-Sent Events para el streaming del LLM (y, más tarde,
para enviar señales de animación al avatar).
**Por qué:** unidireccional servidor→cliente, ligero, nativo en Next.js, ideal
para tokens de LLM. WebSockets se evaluará solo si hace falta bidireccionalidad.

### D-006 · Honestidad por diseño (modo mock visible)
**Decisión:** cuando una respuesta es simulada, la UI lo dice explícitamente.
**Por qué:** el "Documento Maestro" original presentaba como terminado lo que no
existía. Nunca repetir eso: lo simulado se etiqueta como simulado.

---

## Modelo de agentes (estado actual)

Definidos en `frontend/src/types/index.ts` como `AGENTS`:

| id | Nombre UI | Rol | Webhook n8n | Color |
|---|---|---|---|---|
| `productivity` | Productividad | Calendario, recordatorios | `/webhook/agent-productivity` | `#00d4ff` |
| `engram` | Contexto | Resumen de jornada, engramas | `/webhook/agent-engram` | `#a855f7` |
| `weather` | Entorno | Clima y consejos | `/webhook/agent-weather` | `#22c55e` |

> El concepto "granja/jardín" del documento usaba avatares distintos
> (Manin/Análisis/Archivos). Se decidió **mantener estos 3 agentes reales**
> porque están cableados al backend (`engine/`), y aplicarles la estética
> gamificada por encima. El "Jefe/orquestador" llegará en la Fase 3.

---

## Glosario

- **Engine:** el backend en GCP (Caddy + n8n + Ollama).
- **Engrama:** una nota de conocimiento del usuario (feature de la app, no
  confundir con este documento).
- **Modo mock:** el frontend sin `NEXT_PUBLIC_ENGINE_URL`; respuestas simuladas.
- **A2A:** Agent-to-Agent; sincronización entre el estado de la IA y la animación.
