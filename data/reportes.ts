import type { VentaPorDia } from "@/types";

/** Historial de ventas diarias para gráficos (últimos ~90 días, datos mock) */
export const ventasHistoricas: VentaPorDia[] = generarVentasHistoricas();

function generarVentasHistoricas(): VentaPorDia[] {
  const datos: VentaPorDia[] = [];
  const hoy = new Date("2026-06-20");

  for (let i = 89; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);

    const diaSemana = fecha.getDay();
    const esFinDeSemana = diaSemana === 5 || diaSemana === 6;
    const baseVentas = esFinDeSemana ? 28 : 16;
    const variacion = Math.sin(i * 0.4) * 6 + (i % 7) * 1.5;
    const ventas = Math.max(8, Math.round(baseVentas + variacion));
    const ticketPromedio = esFinDeSemana ? 18500 : 14200;
    const ingresos = ventas * ticketPromedio + Math.round((i % 5) * 120000);

    datos.push({
      fecha: fecha.toISOString().slice(0, 10),
      ventas,
      ingresos,
    });
  }

  return datos;
}
