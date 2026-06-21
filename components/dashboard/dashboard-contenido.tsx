"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { GraficoVentas } from "@/components/reportes/grafico-ventas";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { StockBadge } from "@/components/ui/stock-badge";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { calcularIndicadores } from "@/lib/indicadores";
import type { Metrica } from "@/types";
import { MONEDA, formatearFecha, formatearMoneda, formatearNumero, formatearPorcentaje } from "@/lib/formato";

export function DashboardContenido() {
  const { estado, listo, ventasHoyResumen, ingresosMesActual, ventasPorDia } = useNegocio();

  const ind = useMemo(() => calcularIndicadores(estado), [estado]);

  const metricasFinanzas: Metrica[] = useMemo(
    () => [
      {
        id: "ingresos",
        titulo: "Ingresos por ventas",
        valor: ind.ingresosVentas,
        formato: "moneda",
        descripcion: `${formatearNumero(ind.unidadesVendidas)} uds. · ${MONEDA}`,
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
        descripcion: `Después de gastos y pérdidas · ${MONEDA}`,
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
        titulo: "Gastos acumulados",
        valor: ind.totalGastos,
        formato: "moneda",
        tono: "advertencia",
      },
      {
        id: "perdidas",
        titulo: "Pérdidas acumuladas",
        valor: ind.totalPerdidas,
        formato: "moneda",
        tono: "negativo",
      },
    ],
    [ventasHoyResumen, ingresosMesActual, ind]
  );

  const alertasStock = useMemo(
    () =>
      estado.productos
        .filter((p) => p.stock === 0 || (p.stock > 0 && p.stock <= p.stockMinimo))
        .slice(0, 8),
    [estado.productos]
  );

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  const recientes = estado.ventas.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        titulo="Dashboard"
        descripcion={`Panel de control Jangueo · todos los montos en ${MONEDA}`}
        acciones={
          <Link href="/productos">
            <Boton>Vender ahora</Boton>
          </Link>
        }
      />

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Resultado del negocio ({MONEDA})
        </h2>
        <MetricCards metricas={metricasFinanzas} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Operación y egresos
        </h2>
        <MetricCards metricas={metricasOperacion} />
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <GraficoVentas
            datos={ventasPorDia}
            titulo="Tendencia de ingresos"
            compacto
          />
        </div>

        <div className="flex flex-col gap-6 xl:col-span-2">
          <Tarjeta>
            <h2 className="text-base font-semibold text-slate-900">Productos más vendidos</h2>
            {ind.productosMasVendidos.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Sin ventas registradas.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {ind.productosMasVendidos.slice(0, 5).map((p, i) => (
                  <li key={p.nombre} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm text-slate-800">{p.nombre}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-slate-900">
                        {formatearNumero(p.cantidad)} uds.
                      </p>
                      <p className="text-[11px] text-muted">{formatearMoneda(p.ingresos)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>

          <Tarjeta>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Inventario en alerta</h2>
              <Link
                href="/inventario"
                className="text-xs font-medium text-accent hover:text-accent-hover"
              >
                Ver todo
              </Link>
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatearNumero(ind.stockBajo)} stock bajo · {formatearNumero(ind.agotados)} agotados
            </p>
            {alertasStock.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Sin alertas activas.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {alertasStock.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="truncate text-sm text-slate-800">{p.nombre}</span>
                    <StockBadge stock={p.stock} minimo={p.stockMinimo} />
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {recientes.length === 0 ? (
            <Tarjeta className="text-sm text-muted">
              Sin ventas aún. Ve a <Link href="/productos" className="text-accent">Productos</Link>{" "}
              y usa el botón <strong>Vender</strong>.
            </Tarjeta>
          ) : (
            <DataTable
              titulo={`Ventas recientes (${MONEDA})`}
              encabezados={["Fecha", "Producto", "Cant.", "Total"]}
              pie={
                <Link
                  href="/ventas"
                  className="text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Ver todas →
                </Link>
              }
            >
              {recientes.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3 text-sm text-slate-600 sm:px-6">
                    {formatearFecha(v.fecha)}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-slate-900 sm:px-6">
                    {v.productoNombre}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 sm:px-6">
                    {formatearNumero(v.cantidad)}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900 sm:px-6">
                    {formatearMoneda(v.total)}
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <Tarjeta>
          <h2 className="text-base font-semibold text-slate-900">Accesos rápidos</h2>
          <div className="mt-4 grid gap-2">
            {[
              { href: "/productos", texto: "Vender productos" },
              { href: "/gastos", texto: "Registrar gasto" },
              { href: "/perdidas", texto: "Registrar pérdida" },
              { href: "/estadisticas", texto: "Ver estadísticas" },
              { href: "/reportes", texto: "Reportes detallados" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
              >
                {item.texto}
              </Link>
            ))}
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
