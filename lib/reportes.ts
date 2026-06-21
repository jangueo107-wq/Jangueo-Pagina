import type { PeriodoReporte, PuntoReporte, VentaPorDia } from "@/types";

function obtenerNumeroSemana(fecha: Date): string {
  const inicioAnio = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor(
    (fecha.getTime() - inicioAnio.getTime()) / (24 * 60 * 60 * 1000)
  );
  const semana = Math.ceil((dias + inicioAnio.getDay() + 1) / 7);
  return `S${semana}`;
}

function etiquetaMes(fecha: Date): string {
  return fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
}

function etiquetaDia(fecha: Date): string {
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function agrupar(
  mapa: Map<string, PuntoReporte>,
  clave: string,
  ventas: number,
  ingresos: number
) {
  const existente = mapa.get(clave);
  if (existente) {
    existente.ventas += ventas;
    existente.ingresos += ingresos;
  } else {
    mapa.set(clave, { etiqueta: clave, ventas, ingresos });
  }
}

export function agruparPorPeriodo(
  datos: VentaPorDia[],
  periodo: PeriodoReporte
): PuntoReporte[] {
  if (datos.length === 0) return [];

  const mapa = new Map<string, PuntoReporte>();

  for (const registro of datos) {
    const fecha = new Date(`${registro.fecha}T12:00:00`);

    if (periodo === "dia") {
      agrupar(mapa, etiquetaDia(fecha), registro.ventas, registro.ingresos);
    } else if (periodo === "semana") {
      const clave = `${obtenerNumeroSemana(fecha)} · ${fecha.getFullYear()}`;
      agrupar(mapa, clave, registro.ventas, registro.ingresos);
    } else {
      agrupar(mapa, etiquetaMes(fecha), registro.ventas, registro.ingresos);
    }
  }

  return Array.from(mapa.values());
}

export function filtrarDatosPorPeriodo(
  datos: VentaPorDia[],
  periodo: PeriodoReporte
): VentaPorDia[] {
  const limite =
    periodo === "dia" ? 14 : periodo === "semana" ? 56 : datos.length;

  return datos.slice(-limite);
}

export function obtenerResumenReporte(puntos: PuntoReporte[]) {
  const totalVentas = puntos.reduce((acc, p) => acc + p.ventas, 0);
  const totalIngresos = puntos.reduce((acc, p) => acc + p.ingresos, 0);
  const promedioIngresos =
    puntos.length > 0 ? Math.round(totalIngresos / puntos.length) : 0;

  return { totalVentas, totalIngresos, promedioIngresos, puntos: puntos.length };
}
