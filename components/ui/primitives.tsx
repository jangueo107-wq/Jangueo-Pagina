import type { ReactNode } from "react";
import { cn, obtenerEtiquetaEstado } from "@/lib/formato";

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}

export function PageHeader({ titulo, descripcion, acciones }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {titulo}
        </h1>
        {descripcion ? (
          <p className="mt-1 text-sm text-muted sm:text-base">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="flex shrink-0 gap-2">{acciones}</div> : null}
    </div>
  );
}

interface BotonProps {
  children: ReactNode;
  variante?: "primario" | "secundario" | "fantasma";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

export function Boton({
  children,
  variante = "primario",
  className,
  type = "button",
  onClick,
  disabled,
}: BotonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        variante === "primario" && "bg-accent text-white hover:bg-accent-hover",
        variante === "secundario" &&
          "border border-border bg-white text-slate-700 hover:bg-slate-50",
        variante === "fantasma" && "text-slate-600 hover:bg-slate-100",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TarjetaProps {
  children: ReactNode;
  className?: string;
}

export function Tarjeta({ children, className }: TarjetaProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface EstadoVacioProps {
  titulo: string;
  descripcion: string;
  icono?: string;
}

export function EstadoVacio({ titulo, descripcion, icono = "◌" }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-slate-50/50 px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-muted shadow-sm ring-1 ring-border">
        {icono}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{descripcion}</p>
    </div>
  );
}

interface BadgeEstadoProps {
  estado: string;
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const { texto, clase } = obtenerEtiquetaEstado(estado);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        clase
      )}
    >
      {texto}
    </span>
  );
}
