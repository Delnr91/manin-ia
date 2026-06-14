# 📍 Plan Maestro — Manin-IA

Este documento reemplaza al "Documento Maestro" original, que describía como
**completadas** fases que no existían en el código. Aquí el estado es **real y
verificable**: cada fase tiene un criterio de "hecho" que se puede comprobar.

Última actualización: **2026-06-14**.

---

## Principios

1. **Construcción vertical antes que horizontal.** Una función fina de punta a
   punta antes que muchas pantallas bonitas pero muertas.
2. **Honestidad por diseño.** Si algo está simulado (mock), la UI lo dice. Nunca
   aparentamos que la IA "piensa" cuando no.
3. **Verificable.** Una fase no está "hecha" sin una prueba observable.
4. **GitHub es la fuente única de verdad.** Lo local es un espejo desechable.

---

## Estado por fases

| Fase | Descripción | Estado | Criterio de "hecho" |
|---|---|---|---|
| **0** | Cimientos: monorepo, Next.js + TS + Tailwind, build/dev | ✅ Hecho | `npm run build` y `npm run dev` funcionan |
| **1** | UI de chat real (glassmorphism, sidebar de agentes, fondo) sobre los hooks existentes | ✅ Hecho | Enviar mensaje → respuesta (mock) del agente activo |
| **1.5** | Calidad base: ESLint/TS en verde, **testing desde día 1** (Vitest + RTL) | ✅ Hecho | `npm test`, `npm run lint`, `npm run typecheck` verdes |
| **2** | Conectar el **Engine real**: webhooks n8n → Llama 3 (Ollama en GCP), streaming | ⏳ Siguiente | Una pregunta recibe respuesta real de Llama 3 |
| **3** | Orquestación multi-agente (el "Jefe" decide qué agente atiende) | ⬜ Pendiente | Un mensaje se enruta al agente correcto automáticamente |
| **4** | **Jardín de Saturno 3D interactivo** (React Three Fiber): flores/orquídeas-tigre vivas | ⬜ Pendiente | El fondo 3D se ve y reacciona al cursor |
| **5** | Gamificación viva (A2A): el avatar del agente reacciona/“camina” según el estado de la IA | ⬜ Pendiente | Al pedir algo, el agente correspondiente se anima |
| **6** | Herramientas físicas: workflows n8n reales (Google Calendar, correo) | ⬜ Pendiente | Un mensaje crea de verdad un evento en el calendario |

---

## Decisiones técnicas que condicionan el plan

- **Todo TypeScript.** Frontend (obligado por Next.js) y orquestación
  (`@langchain/langgraph` JS cuando llegue la Fase 3). Un solo lenguaje, un solo
  runtime. Ver [ENGRAM.md](ENGRAM.md#d-002).
- **Infra ya viva en Google Cloud.** Ollama (Llama 3) y n8n corren en GCP. La app
  solo tiene que llamarlos por URL. (El `engine/docker-compose.yml` menciona
  Oracle Cloud como objetivo original; en la práctica está en GCP.)
- **Fondo: video → 3D.** Hoy hay un `.mp4` de placeholder. La visión real es un
  jardín **3D interactivo** (Three.js / React Three Fiber), no PixiJS 2.5D como
  decía el documento original. Ver [ENGRAM.md](ENGRAM.md#d-004).
- **Streaming por SSE** (planeado) para las respuestas del LLM y, más adelante,
  para mandar señales de animación al avatar.

---

## Próximo paso inmediato (Fase 2)

Conectar el `AgentClient` al Engine real:

1. Definir `NEXT_PUBLIC_ENGINE_URL` y la estrategia de claves (ver
   [SECURITY.md](SECURITY.md): hoy `NEXT_PUBLIC_API_KEY` se expone al navegador →
   conviene un proxy server-side en Next.js).
2. Crear el/los workflow(s) en n8n que reciban el webhook y llamen a Ollama.
3. Implementar streaming (SSE) en una ruta de API de Next.js que haga de puente
   navegador ↔ Engine.
4. Verificar: una pregunta recibe respuesta **real** de Llama 3.
