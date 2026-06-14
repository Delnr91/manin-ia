# 🔒 Seguridad — Manin-IA

Baseline de seguridad y pendientes. Se actualiza a medida que el proyecto crece.
Prioridad: **alta** antes de exponer cualquier cosa a internet.

---

## 🔴 Hallazgos a resolver antes de producción

### S-1 · `NEXT_PUBLIC_API_KEY` se expone al navegador
`AgentClient.ts` lee `process.env.NEXT_PUBLIC_API_KEY` y la manda como cabecera
`X-API-Key`. **Todo lo que empieza con `NEXT_PUBLIC_` se incluye en el bundle de
JavaScript que descarga el navegador** → cualquiera puede leer esa clave y llamar
tus webhooks de n8n.
**Acción:** no usar `NEXT_PUBLIC_` para secretos. Crear una **ruta de API en
Next.js** (server-side) que guarde la clave real y haga de proxy al Engine. El
navegador habla con tu propio servidor, no directamente con n8n.

### S-2 · Ollama no debe quedar abierto a internet
Ollama no trae autenticación. Si su puerto (11434) queda expuesto en GCP,
cualquiera puede usar tu modelo y consumir la VM.
**Acción:** acceder a Ollama **solo** a través de Caddy con la
`OLLAMA_API_KEY` (ya contemplado en `engine/`), y cerrar el puerto directo en el
firewall de GCP. Nunca publicar 11434 al mundo.

### S-3 · Webhooks de n8n públicos
Los webhooks son URLs invocables. Sin protección, son una superficie de ataque.
**Acción:** exigir una cabecera/clave validada en cada workflow, y considerar
rate-limiting en Caddy.

---

## 🟢 Buenas prácticas ya aplicadas

- **Secretos fuera del repo:** `.gitignore` excluye `.env` y `.env.*` (salvo
  `.env.example`). El `engine/` usa `.env.example` como plantilla.
- **n8n no se publica directo:** en `docker-compose.yml` usa `expose` (red
  interna), y Caddy es el único punto de entrada con TLS automático.
- **`N8N_ENCRYPTION_KEY`:** cifra credenciales almacenadas por n8n.
- **`storage.ts` defensivo:** lecturas/escrituras de localStorage envueltas en
  try/catch y guardas de `window` (seguro en SSR).

---

## Gestión de secretos

| Secreto | Dónde vive | Nunca |
|---|---|---|
| `OLLAMA_API_KEY` | `engine/.env` (servidor) | en el frontend |
| `N8N_ENCRYPTION_KEY` | `engine/.env` (servidor) | en git |
| Clave del Engine para el frontend | ruta API de Next.js (server-side) | en `NEXT_PUBLIC_*` |

**Generar claves:** `openssl rand -hex 32`.

---

## Checklist antes de exponer a internet

- [ ] S-1 resuelto: secreto del Engine movido a un proxy server-side.
- [ ] S-2 resuelto: puerto de Ollama cerrado; acceso solo vía Caddy + clave.
- [ ] S-3 resuelto: webhooks de n8n autenticados.
- [ ] `.env` reales fuera de git (verificado con `git status`).
- [ ] HTTPS forzado (Caddy ya lo hace) y HSTS.
- [ ] Revisar dependencias: `npm audit`.
