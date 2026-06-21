import type { Metrica } from "@/types";
import {
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
  cn,
} from "@/lib/formato";
import { Tarjeta } from "@/components/ui/primitives";

interface MetricCardsProps {
  metricas: Metrica[];
}

function formatearValor(metrica: Metrica): string {
  switch (metrica.formato) {
    case "moneda":
      return formatearMoneda(metrica.valor);
    case "porcentaje":
      return formatearPorcentaje(metrica.valor);
    default:
      return formatearNumero(metrica.valor);
  }
}

function tonoClase(tono?: Metrica["tono"]) {
  switch (tono) {
    case "positivo":
      return "text-emerald-600";
    case "negativo":
      return "text-red-600";
    case "advertencia":
      return "text-amber-600";
    default:
      return "text-slate-900";
  }
}

export function MetricCards({ metricas }: MetricCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricas.map((metrica) => (
        <Tarjeta key={metrica.id} className="flex flex-col gap-2 p-5">
          <p className="text-sm font-medium text-muted">{metrica.titulo}</p>
          <p className={cn("mt-1 text-xl font-semibold", tonoClase(metrica.tono))}>
            {formatearValor(metrica)}
          </p>
          {metrica.descripcion ? (
            <p className="text-xs text-muted">{metrica.descripcion}</p>
          ) : null}
          {metrica.variacion !== undefined ? (
            <span
              className={
                metrica.variacion >= 0
                  ? "text-xs font-medium text-emerald-600"
                  : "text-xs font-medium text-red-600"
              }
            >
              {formatearPorcentaje(metrica.variacion)}
            </span>
          ) : null}
        </Tarjeta>
      ))}
    </div>
  );
}
