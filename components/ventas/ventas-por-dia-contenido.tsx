"use client";

import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader, Tarjeta } from "@/components/ui/primitives";
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/formato";

export function VentasPorDiaContenido() {
  const { ventasPorDia, listo } = useNegocio();

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  const totalVentas = ventasPorDia.reduce((acc, d) => acc + d.ventas, 0);
  const totalIngresos = ventasPorDia.reduce((acc, d) => acc + d.ingresos, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Ventas por día"
        descripcion="Detalle diario generado desde tus ventas registradas."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta>
          <p className="text-sm text-muted">Unidades vendidas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatearNumero(totalVentas)}
          </p>
        </Tarjeta>
        <Tarjeta>
          <p className="text-sm text-muted">Ingresos</p>
          <p className="mt-2 text-2xl font-semibold text-accent">
            {formatearMoneda(totalIngresos)}
          </p>
        </Tarjeta>
      </div>

      {ventasPorDia.length === 0 ? (
        <Tarjeta className="text-center text-sm text-muted">
          Sin ventas registradas. Vende productos para ver el detalle diario.
        </Tarjeta>
      ) : (
        <DataTable encabezados={["Fecha", "Unidades", "Ingresos"]}>
          {[...ventasPorDia].reverse().map((dia) => (
            <tr key={dia.fecha} className="hover:bg-slate-50/80">
              <td className="px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
                {formatearFecha(dia.fecha)}
              </td>
              <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                {formatearNumero(dia.ventas)}
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                {formatearMoneda(dia.ingresos)}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
