/**
 * Video de fondo en bucle (placeholder de la ambientación de Saturno).
 * En la Fase 4 esto se reemplaza por el jardín 3D interactivo (R3F).
 * Lleva capas de degradado para mantener legible el texto del chat.
 */
export default function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05060f]">
      <video
        className="h-full w-full object-cover opacity-40"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/Untitled.mp4" type="video/mp4" />
      </video>

      {/* Velo para contraste + viñeta. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060f]/70 via-[#05060f]/50 to-[#05060f]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,6,15,0.85)_100%)]" />
    </div>
  );
}
