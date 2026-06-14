// Registro de iconos lucide usados por los agentes.
// Mapea el nombre (string en types/index.ts) al componente real.
import { Calendar, Brain, CloudSun } from "lucide-react";

type IconComponent = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

const ICONS: Record<string, IconComponent> = {
  Calendar,
  Brain,
  CloudSun,
};

/** Renderiza el icono de un agente por su nombre; cae a Brain si no existe. */
export function AgentIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Brain;
  return <Cmp size={size} className={className} />;
}
