# 🧪 Estrategia de Testing — Manin-IA

Testing **desde el día 1**. La meta no es cobertura por cobertura, sino una red
de seguridad que permita avanzar rápido sin romper lo que ya funciona.

## Stack

- **Vitest** — runner rápido, compatible con Vite/TS.
- **@testing-library/react** — tests de componentes centrados en el usuario.
- **jsdom** — DOM en Node para los tests.
- **@testing-library/jest-dom** — matchers (`toBeInTheDocument`, etc.).

Configuración: `frontend/vitest.config.ts` y `frontend/vitest.setup.ts`
(limpia DOM y `localStorage` tras cada test).

## Comandos

```bash
cd frontend
npm test          # corre toda la suite una vez
npm run test:watch  # modo watch durante el desarrollo
```

## Pirámide (objetivo)

```
        ▲  E2E (pocos)        ← futuro: Playwright sobre flujos clave
       ───
      ─────  Componentes      ← RTL: render + interacción (sidebar, chat)
    ─────────
  ─────────────  Unidad (muchos) ← lógica pura: storage, AgentClient, helpers
```

## Qué probamos hoy (y por qué)

| Archivo | Tipo | Cubre |
|---|---|---|
| `services/storage.test.ts` | Unidad | CRUD de engramas, aislamiento de chat por agente, recorte a 100 mensajes |
| `services/AgentClient.test.ts` | Unidad | Modo mock, respuesta correcta por agente, healthCheck |
| `components/AgentSidebar.test.tsx` | Componente | Render de agentes, estado activo, `onSelect`, aviso de modo mock |

## Convenciones

- Los tests viven **junto al código** (`*.test.ts(x)`).
- Cada test es **aislado**: nada de estado compartido entre tests (el setup
  limpia `localStorage`).
- Se prueba **comportamiento observable**, no detalles internos.
- Un test que falla por azar (p. ej. timestamps en el mismo milisegundo) se
  arregla haciéndolo determinista, no ignorándolo.

## Gates de calidad (antes de cada commit relevante)

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Pendiente

- Tests de `useChat` / `useAgent` (hooks) con `renderHook`.
- E2E con Playwright para el flujo enviar→responder cuando exista el Engine real.
- CI en GitHub Actions que corra los gates en cada push (Fase 2+).
