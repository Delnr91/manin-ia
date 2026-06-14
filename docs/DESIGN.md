# 🎨 Dirección de diseño — Manin-IA

## Norte visual: el Jardín de Saturno

El fondo **no es decoración, es la narrativa**. La ambientación es un jardín
futurista en Saturno cuya pieza central es una **orquídea-tigre translúcida**:
flor 3D de malla/wireframe, iridiscente (azules, violetas, magentas), sobre
fondo negro profundo, con anotaciones sutiles tipo "blueprint" técnico.

> **Referencia maestra:** guardar la imagen de referencia del usuario en
> `frontend/public/reference/orchid-saturn.png`. (Es el render objetivo que
> define color, transparencia y composición.)

### Atributos del look
- **Translúcido / wireframe:** se ve la estructura interna de la flor.
- **Iridiscente:** degradados fríos (cian → violeta → magenta) que cambian con la luz.
- **Fondo negro** (`#05060f`) con viñeta; la flor "flota" y emite bloom.
- **Anotaciones blueprint** opcionales: líneas y etiquetas técnicas tenues.
- **Vivo:** rota lento, respira, y reacciona al cursor / al estado de la IA.

## Estética de la UI (ya implementada)
- **Glassmorphism / cristal translúcido**: paneles con `backdrop-blur`,
  bordes `white/10`, fondos `white/5`.
- **Acentos por agente** (color propio): Productividad `#00d4ff`,
  Contexto `#a855f7`, Entorno `#22c55e`.
- Tipografía Geist; animaciones suaves de entrada (`rise`) y "escribiendo".

## Plan de implementación del fondo (Fase 4)

| Camino | Resultado | Esfuerzo | Cuándo |
|---|---|---|---|
| **A. Imagen + shader** | La referencia como fondo con parallax/brillo animado | Bajo | Quick win inmediato |
| **B. Orquídea 3D en React Three Fiber** | Malla translúcida interactiva con bloom | Medio | Fase 4 real |
| **C. Modelo Blender → R3F** | Máxima fidelidad al render | Alto | Solo si se requiere |

Tecnología objetivo: **Three.js / React Three Fiber** + `@react-three/drei`
(controles, efectos) + post-procesado **bloom**. NO PixiJS 2.5D, NO video plano.

## Lo que NO existe todavía (honestidad)
- La "oficina/granja isométrica con avatares pixel trabajando" del documento
  original **nunca se construyó**. No hay nada guardado; es trabajo de Fase 4/5.
- El fondo actual (`/Untitled.mp4`) es un **placeholder** temporal.
