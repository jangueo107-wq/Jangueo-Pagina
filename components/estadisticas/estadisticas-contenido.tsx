"use client";

import { useMemo } from "react";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { StatRow } from "@/components/ui/data-table";
import { StockBadge } from "@/components/ui/stock-badge";
import { PageHeader, Tarjeta } from "@/components/ui/primitives";
import { calcularIndicadores } from "@/lib/indicadores";
import type { Metrica } from "@/types";
import { MONEDA, formatearMoneda, formatearNumero, formatearPorcentaje } from "@/lib/formato";

export function EstadisticasContenido() {
  const { estado, listo, ventasHoyResumen, ingresosMesActual } = useNegocio();

  const ind = useMemo(() => calcularIndicadores(estado), [estado]);

  const metricasPrincipales: Metrica[] = useMemo(
    () => [
      {
        id: "ingresos",
        titulo: "Ingresos por ventas",
        valor: ind.ingresosVentas,
        formato: "moneda",
        descripcion: `${formatearNumero(ind.unidadesVendidas)} unidades vendidas`,
      },
      {
        id: "utilidad-bruta",
        titulo: "Utilidad bruta",
        valor: ind.utilidadBruta,
        formato: "moneda",
        tono: ind.utilidadBruta >= 0 ? "positivo" : "negativo",
        descripcion: `Margen ${formatearPorcentaje(ind.margenBrutoPct)}`,
      },
      {
        id: "utilidad-neta",
        titulo: "Utilidad neta",
        valor: ind.utilidadNeta,
        formato: "moneda",
        tono: ind.utilidadNeta >= 0 ? "positivo" : "negativo",
        descripcion: "Después de gastos y pérdidas",
      },
      {
        id: "resultado",
        titulo: "Ganancia / pérdida total",
        valor: ind.utilidadNeta,
        formato: "moneda",
        tono: ind.utilidadNeta >= 0 ? "positivo" : "negativo",
        descripcion: ind.utilidadNeta >= 0 ? "Resultado positivo" : "Resultado negativo",
      },
    ],
    [ind]
  );

  const metricasOperacion: Metrica[] = useMemo(
    () => [
      {
        id: "ventas-hoy",
        titulo: "Ventas hoy",
        valor: ventasHoyResumen.ingresos,
        formato: "moneda",
        descripcion: `${formatearNumero(ventasHoyResumen.cantidad)} uds.`,
      },
      {
        id: "ingresos-mes",
        titulo: "Ingresos del mes",
        valor: ingresosMesActual,
        formato: "moneda",
      },
      {
        id: "gastos",
        titulo: "Total gastos",
        valor: ind.totalGastos,
        formato: "moneda",
        tono: "advertencia",
      },
      {
        id: "perdidas",
        titulo: "Total pérdidas",
        valor: ind.totalPerdidas,
        formato: "moneda",
        tono: "negativo",
      },
    ],
    [ventasHoyResumen, ingresosMesActual, ind]
  );

  const productosStockBajo = useMemo(
    () =>
      estado.productos.filter((p) => p.stock > 0 && p.stock <= p.stockMinimo).slice(0, 6),
    [estado.productos]
  );

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        titulo="Estadísticas"
        descripcion={`Panel financiero y operativo · montos en ${MONEDA} sin abreviaciones`}
      />

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Resultado del negocio ({MONEDA})
        </h2>
        <MetricCards metricas={metricasPrincipales} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Operación
        </h2>
        <MetricCards metricas={metricasOperacion} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta>
          <h2 className="text-base font-semibold text-slate-900">Desglose financiero</h2>
          <div className="mt-4">
            <StatRow etiqueta="Ingresos por ventas" valor={formatearMoneda(ind.ingresosVentas)} destacado />
            <StatRow etiqueta="Costo de ventas" valor={formatearMoneda(ind.costoVentas)} />
            <StatRow etiqueta="Utilidad bruta" valor={formatearMoneda(ind.utilidadBruta)} destacado />
            <StatRow etiqueta="Gastos operativos" valor={formatearMoneda(ind.totalGastos)} />
            <StatRow etiqueta="Pérdidas de inventario" valor={formatearMoneda(ind.totalPerdidas)} />
            <StatRow
              etiqueta="Utilidad neta"
              valor={formatearMoneda(ind.utilidadNeta)}
              destacado
            />
            <StatRow etiqueta="Ticket promedio" valor={formatearMoneda(ind.ticketPromedio)} />
            <StatRow
              etiqueta="Margen neto"
              valor={formatearPorcentaje(ind.margenNetoPct)}
            />
          </div>
        </Tarjeta>

        <Tarjeta>
          <h2 className="text-base font-semibold text-slate-900">Productos más vendidos</h2>
          {ind.productosMasVendidos.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Aún no hay ventas registradas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {ind.productosMasVendidos.map((p, i) => (
                <li key={p.nombre} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-900">{p.nombre}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatearNumero(p.cantidad)} uds.
                    </p>
                    <p className="text-xs text-muted">{formatearMoneda(p.ingresos)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <Tarjeta>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Inventario en alerta</h2>
            <p className="mt-1 text-sm text-muted">
              {ind.stockBajo} con stock bajo · {ind.agotados} agotados
            </p>
          </div>
        </div>
        {productosStockBajo.length === 0 && ind.agotados === 0 ? (
          <p className="mt-4 text-sm text-muted">No hay alertas de inventario.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {estado.productos
              .filter((p) => p.stock === 0 || (p.stock > 0 && p.stock <= p.stockMinimo))
              .slice(0, 12)
              .map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-slate-50/80 px-3 py-2"
                >
                  <span className="text-sm text-slate-800">{p.nombre}</span>
                  <StockBadge stock={p.stock} minimo={p.stockMinimo} />
                </li>
              ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
