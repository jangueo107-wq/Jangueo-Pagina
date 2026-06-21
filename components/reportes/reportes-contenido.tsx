"use client";

import { GraficoVentas } from "@/components/reportes/grafico-ventas";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { reportesDisponibles } from "@/data/mock";
import { ventasHistoricas } from "@/data/reportes";
import { MONEDA } from "@/lib/formato";
import { useMemo } from "react";

export function ReportesContenido() {
  const { ventasPorDia, listo } = useNegocio();

  const datosGrafico = useMemo(() => {
    if (ventasPorDia.length > 0) return ventasPorDia;
    return ventasHistoricas;
  }, [ventasPorDia]);

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Reportes"
        descripcion={`Resumen visual de ingresos · valores completos en ${MONEDA}`}
      />

      <GraficoVentas datos={datosGrafico} />

      <div className="grid gap-4 lg:grid-cols-2">
        {reportesDisponibles.map((reporte) => (
          <Tarjeta key={reporte.id} className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{reporte.titulo}</h2>
              <p className="mt-1 text-sm text-muted">{reporte.descripcion}</p>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                {reporte.formato}
              </span>
              <Boton variante="secundario" disabled>
                Exportar pronto
              </Boton>
            </div>
          </Tarjeta>
        ))}
      </div>
    </div>
  );
}
