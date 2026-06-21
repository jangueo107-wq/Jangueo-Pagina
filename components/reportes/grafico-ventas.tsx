"use client";

import { useMemo, useState } from "react";
import { EstadoVacio, Tarjeta } from "@/components/ui/primitives";
import type { PeriodoReporte, PuntoReporte, VentaPorDia } from "@/types";
import {
  agruparPorPeriodo,
  filtrarDatosPorPeriodo,
  obtenerResumenReporte,
} from "@/lib/reportes";
import {
  MONEDA,
  formatearMoneda,
  formatearMonedaEje,
  formatearNumero,
  margenIzquierdoGrafico,
  cn,
} from "@/lib/formato";

interface GraficoVentasProps {
  datos: VentaPorDia[];
  titulo?: string;
  compacto?: boolean;
}

const PERIODOS: { id: PeriodoReporte; etiqueta: string }[] = [
  { id: "dia", etiqueta: "Días" },
  { id: "semana", etiqueta: "Semanas" },
  { id: "mes", etiqueta: "Meses" },
];

const ALTURA = 228;
const MARGEN_DERCHA = 20;
const MARGEN_ABAJO = 40;
const MARGEN_ARRIBA = 28;
const PASOS_EJE = 3;

export function GraficoVentas({
  datos,
  titulo = "Ingresos por ventas",
  compacto = false,
}: GraficoVentasProps) {
  const [periodo, setPeriodo] = useState<PeriodoReporte>("dia");
  const [indiceHover, setIndiceHover] = useState<number | null>(null);

  const puntos = useMemo(() => {
    const filtrados = filtrarDatosPorPeriodo(datos, periodo);
    const agrupados = agruparPorPeriodo(filtrados, periodo);
    const limite = periodo === "dia" ? 10 : 6;
    return agrupados.slice(-limite);
  }, [datos, periodo]);

  const resumen = useMemo(() => obtenerResumenReporte(puntos), [puntos]);
  const maxIngresos = Math.max(...puntos.map((p) => p.ingresos), 1);

  const valoresEje = useMemo(
    () =>
      Array.from({ length: PASOS_EJE + 1 }, (_, i) => (maxIngresos / PASOS_EJE) * (PASOS_EJE - i)),
    [maxIngresos]
  );

  const margenIzquierda = useMemo(() => margenIzquierdoGrafico(valoresEje), [valoresEje]);

  const anchoBarraArea = Math.max(puntos.length * 64, compacto ? 280 : 360);
  const anchoTotal = margenIzquierda + anchoBarraArea + MARGEN_DERCHA;
  const alturaTotal = ALTURA + MARGEN_ARRIBA + MARGEN_ABAJO;

  if (datos.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin datos de ventas"
        descripcion="Registra ventas en Productos para ver ingresos en COP."
        icono="▥"
      />
    );
  }

  if (puntos.length === 0) {
    return (
      <EstadoVacio
        titulo="Datos insuficientes"
        descripcion="No hay suficientes registros para el periodo seleccionado."
        icono="▥"
      />
    );
  }

  const puntoActivo = indiceHover !== null ? puntos[indiceHover] : null;

  return (
    <Tarjeta className="overflow-hidden p-0">
      <div className="border-b border-border px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted">
                {MONEDA}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {puntoActivo ? (
                <>
                  <span className="font-medium text-slate-800">{puntoActivo.etiqueta}</span>
                  {" · "}
                  {formatearMoneda(puntoActivo.ingresos)}
                  {" · "}
                  {formatearNumero(puntoActivo.ventas)} unidades
                </>
              ) : (
                "Selecciona una barra para ver el detalle en pesos colombianos"
              )}
            </p>
          </div>

          <div
            className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1"
            role="tablist"
            aria-label="Periodo del gráfico"
          >
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={periodo === p.id}
                onClick={() => {
                  setPeriodo(p.id);
                  setIndiceHover(null);
                }}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all sm:px-4",
                  periodo === p.id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-border"
                    : "text-muted hover:text-slate-700"
                )}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
        <ResumenCelda
          etiqueta={`Ingresos del periodo (${MONEDA})`}
          valor={formatearMoneda(resumen.totalIngresos)}
          principal
        />
        <ResumenCelda etiqueta="Unidades vendidas" valor={formatearNumero(resumen.totalVentas)} />
        <ResumenCelda
          etiqueta={`Promedio por barra (${MONEDA})`}
          valor={formatearMoneda(resumen.promedioIngresos)}
        />
      </div>

      <div className="overflow-x-auto bg-slate-50/40 px-3 py-8 sm:px-5">
        <svg
          viewBox={`0 0 ${anchoTotal} ${alturaTotal}`}
          className="mx-auto block min-w-full"
          style={{ minWidth: compacto ? 320 : 400, maxWidth: 960 }}
          role="img"
          aria-label={`Gráfico de ingresos en ${MONEDA}`}
        >
          <text
            x={margenIzquierda - 10}
            y={14}
            textAnchor="end"
            fill="var(--muted)"
            fontSize={10}
            fontWeight={500}
          >
            {MONEDA}
          </text>

          {valoresEje.map((valor, i) => {
            const y = MARGEN_ARRIBA + (ALTURA / PASOS_EJE) * i;
            return (
              <g key={valor}>
                <line
                  x1={margenIzquierda}
                  y1={y}
                  x2={anchoTotal - MARGEN_DERCHA}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={margenIzquierda - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--muted)"
                  fontSize={10}
                >
                  {formatearMonedaEje(valor)}
                </text>
              </g>
            );
          })}

          {puntos.map((punto, i) => (
            <BarraGrafico
              key={`${punto.etiqueta}-${i}`}
              punto={punto}
              indice={i}
              total={puntos.length}
              margenIzquierda={margenIzquierda}
              anchoArea={anchoBarraArea}
              maxIngresos={maxIngresos}
              activa={indiceHover === i}
              onHover={setIndiceHover}
            />
          ))}
        </svg>
      </div>
    </Tarjeta>
  );
}

function ResumenCelda({
  etiqueta,
  valor,
  principal,
}: {
  etiqueta: string;
  valor: string;
  principal?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card px-5 py-4 sm:px-6",
        principal && "border-l-4 border-l-accent sm:border-l-4"
      )}
    >
      <p className="text-xs font-medium leading-snug text-muted">{etiqueta}</p>
      <p
        className={cn(
          "mt-1.5 text-lg font-semibold tracking-tight sm:text-xl",
          principal ? "text-accent" : "text-slate-900"
        )}
      >
        {valor}
      </p>
    </div>
  );
}

function BarraGrafico({
  punto,
  indice,
  total,
  margenIzquierda,
  anchoArea,
  maxIngresos,
  activa,
  onHover,
}: {
  punto: PuntoReporte;
  indice: number;
  total: number;
  margenIzquierda: number;
  anchoArea: number;
  maxIngresos: number;
  activa: boolean;
  onHover: (i: number | null) => void;
}) {
  const espacio = anchoArea / total;
  const anchoBarra = Math.min(36, espacio * 0.5);
  const x = margenIzquierda + indice * espacio + (espacio - anchoBarra) / 2;
  const altura = (punto.ingresos / maxIngresos) * ALTURA;
  const y = MARGEN_ARRIBA + (ALTURA - altura);
  const etiqueta =
    punto.etiqueta.length > 12 ? `${punto.etiqueta.slice(0, 11)}…` : punto.etiqueta;

  return (
    <g
      onMouseEnter={() => onHover(indice)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(indice)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      className="cursor-pointer outline-none"
    >
      <rect
        x={x - 4}
        y={MARGEN_ARRIBA}
        width={anchoBarra + 8}
        height={ALTURA}
        fill="transparent"
      />
      <rect
        x={x}
        y={y}
        width={anchoBarra}
        height={Math.max(altura, 4)}
        rx={8}
        fill={activa ? "var(--accent)" : "color-mix(in srgb, var(--accent) 30%, white)"}
      />
      {activa ? (
        <text
          x={x + anchoBarra / 2}
          y={Math.max(y - 8, MARGEN_ARRIBA + 12)}
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize={9}
          fontWeight={600}
        >
          {formatearMoneda(punto.ingresos)}
        </text>
      ) : null}
      <text
        x={x + anchoBarra / 2}
        y={MARGEN_ARRIBA + ALTURA + 24}
        textAnchor="middle"
        fill="var(--muted)"
        fontSize={10}
      >
        {etiqueta}
      </text>
    </g>
  );
}
