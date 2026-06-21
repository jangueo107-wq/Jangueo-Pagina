import { cn } from "@/lib/formato";

interface CampoNumeroProps {
  etiqueta?: string;
  valor: string;
  onChange: (valor: string) => void;
  onBlur?: () => void;
  min?: number;
  className?: string;
  ancho?: "sm" | "md" | "full";
  placeholder?: string;
}

export function CampoNumero({
  etiqueta,
  valor,
  onChange,
  onBlur,
  min = 0,
  className,
  ancho = "sm",
  placeholder,
}: CampoNumeroProps) {
  return (
    <label className={cn("block", className)}>
      {etiqueta ? (
        <span className="mb-1 block text-xs font-medium text-muted">{etiqueta}</span>
      ) : null}
      <input
        type="text"
        inputMode="numeric"
        value={valor}
        min={min}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={onBlur}
        className={cn(
          "rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20",
          ancho === "sm" && "w-20",
          ancho === "md" && "w-28",
          ancho === "full" && "w-full"
        )}
      />
    </label>
  );
}

interface MensajeFeedbackProps {
  mensaje: string | null;
  tipo?: "ok" | "error";
}

export function MensajeFeedback({ mensaje, tipo = "ok" }: MensajeFeedbackProps) {
  if (!mensaje) return null;

  return (
    <p
      className={cn(
        "text-xs font-medium",
        tipo === "error" ? "text-red-600" : "text-emerald-600"
      )}
    >
      {mensaje}
    </p>
  );
}
