/** Moneda única de la aplicación */
export const MONEDA = "COP" as const;

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: MONEDA,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const NUMERO_FORMATTER = new Intl.NumberFormat("es-CO");

const FECHA_FORMATTER = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const FECHA_CORTA_FORMATTER = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "2-digit",
});

/**
 * Formato COP completo para toda la app (sin abreviaciones).
 * Ejemplo: $ 450.000
 */
export function formatearMoneda(valor: number): string {
  return COP_FORMATTER.format(valor);
}

/** Alias explícito — mismos valores COP completos en ejes de gráficos */
export function formatearMonedaEje(valor: number): string {
  return formatearMoneda(valor);
}

/** Espacio izquierdo del SVG según la etiqueta COP más larga */
export function margenIzquierdoGrafico(valores: number[]): number {
  if (valores.length === 0) return 88;
  const maxCaracteres = Math.max(...valores.map((v) => formatearMoneda(v).length));
  return Math.min(148, Math.max(80, Math.ceil(maxCaracteres * 6.4)));
}

export function formatearNumero(valor: number): string {
  return NUMERO_FORMATTER.format(valor);
}

export function formatearPorcentaje(valor: number): string {
  const signo = valor > 0 ? "+" : "";
  return `${signo}${valor.toFixed(1)}%`;
}

export function formatearFecha(fecha: string): string {
  return FECHA_FORMATTER.format(new Date(fecha));
}

export function formatearFechaCorta(fecha: string): string {
  return FECHA_CORTA_FORMATTER.format(new Date(fecha));
}

export function formatearFechaHora(fecha: string, hora: string): string {
  return `${formatearFecha(fecha)} · ${hora}`;
}

export function obtenerEtiquetaEstado(
  estado: string
): { texto: string; clase: string } {
  const estados: Record<string, { texto: string; clase: string }> = {
    completada: {
      texto: "Completada",
      clase: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    },
    pendiente: {
      texto: "Pendiente",
      clase: "bg-amber-50 text-amber-700 ring-amber-600/20",
    },
    cancelada: {
      texto: "Cancelada",
      clase: "bg-red-50 text-red-700 ring-red-600/20",
    },
    recibida: {
      texto: "Recibida",
      clase: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    },
  };

  return (
    estados[estado] ?? {
      texto: estado,
      clase: "bg-slate-50 text-slate-700 ring-slate-600/20",
    }
  );
}

export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}
