"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CampoSelect,
  CampoTexto,
  FormularioRegistro,
} from "@/components/negocio/formulario-registro";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { CampoNumero } from "@/components/ui/campo-numero";
import { StockBadge } from "@/components/ui/stock-badge";
import { PageHeader } from "@/components/ui/primitives";
import { parsearEntero } from "@/lib/almacen";
import { cn, formatearFecha, formatearNumero } from "@/lib/formato";

const TIPOS_AJUSTE = [
  {
    id: "entrada" as const,
    titulo: "Entrada",
    descripcion: "Suma unidades al stock actual (reposición, devolución, etc.).",
  },
  {
    id: "salida" as const,
    titulo: "Salida",
    descripcion: "Resta unidades del stock (muestra, rotura no registrada como pérdida, etc.).",
  },
  {
    id: "reconteo" as const,
    titulo: "Reconteo",
    descripcion: "Fija el stock al valor contado físicamente.",
  },
];

const ETIQUETAS_TIPO: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  reconteo: "Reconteo",
};

export function AjustesContenido() {
  const searchParams = useSearchParams();
  const { estado, listo, agregarAjuste } = useNegocio();
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "salida" | "reconteo">("entrada");
  const [cantidad, setCantidad] = useState("");
  const [nota, setNota] = useState("");

  useEffect(() => {
    const desdeUrl = searchParams.get("producto");
    if (desdeUrl && estado.productos.some((p) => p.id === desdeUrl)) {
      setProductoId(desdeUrl);
    }
  }, [searchParams, estado.productos]);

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  const opciones = estado.productos.map((p) => ({
    valor: p.id,
    etiqueta: p.nombre,
  }));

  const idSeleccionado = productoId || opciones[0]?.valor || "";
  const productoSeleccionado = estado.productos.find((p) => p.id === idSeleccionado);
  const tipoActivo = TIPOS_AJUSTE.find((t) => t.id === tipo)!;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Ajustes de inventario"
        descripcion="Correcciones de stock distintas a una venta o pérdida. Cada ajuste queda en el historial."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {TIPOS_AJUSTE.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTipo(item.id)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              tipo === item.id
                ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                : "border-border bg-white hover:border-accent/30"
            )}
          >
            <p className="text-sm font-semibold text-slate-900">{item.titulo}</p>
            <p className="mt-1 text-xs text-muted">{item.descripcion}</p>
          </button>
        ))}
      </div>

      <FormularioRegistro
        titulo={`Registrar ${tipoActivo.titulo.toLowerCase()}`}
        descripcion={tipoActivo.descripcion}
        onSubmit={() => {
          const qty = parsearEntero(cantidad, tipo === "reconteo" ? 0 : 1);
          if (!idSeleccionado) return "No hay productos.";
          if (qty === null) {
            return tipo === "reconteo"
              ? "Indica el stock contado."
              : "Cantidad inválida (mínimo 1).";
          }
          return agregarAjuste({
            productoId: idSeleccionado,
            tipo,
            cantidad: qty,
            nota: nota.trim() || undefined,
          });
        }}
        onExito={() => {
          setCantidad("");
          setNota("");
        }}
        textoBoton={`Aplicar ${tipoActivo.titulo.toLowerCase()}`}
      >
        <CampoSelect
          etiqueta="Producto"
          valor={idSeleccionado}
          onChange={setProductoId}
          opciones={opciones.length ? opciones : [{ valor: "", etiqueta: "Sin productos" }]}
        />
        {productoSeleccionado ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            Stock actual:
            <StockBadge
              stock={productoSeleccionado.stock}
              minimo={productoSeleccionado.stockMinimo}
            />
            <Link
              href={`/historial-stock?producto=${encodeURIComponent(productoSeleccionado.id)}`}
              className="text-accent hover:underline"
            >
              Ver historial
            </Link>
          </div>
        ) : null}
        <CampoNumero
          etiqueta={tipo === "reconteo" ? "Stock contado" : "Cantidad"}
          valor={cantidad}
          onChange={setCantidad}
          ancho="full"
          placeholder={tipo === "reconteo" ? "Ej. 24" : "Ej. 6"}
        />
        <CampoTexto etiqueta="Nota (opcional)" valor={nota} onChange={setNota} />
      </FormularioRegistro>

      <DataTable
        encabezados={["Fecha", "Producto", "Tipo", "Cantidad", "Stock final", "Nota"]}
      >
        {estado.ajustes.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted sm:px-6">
              Sin ajustes registrados aún.
            </td>
          </tr>
        ) : (
          estado.ajustes.map((ajuste) => (
            <tr key={ajuste.id} className="hover:bg-slate-50/80">
              <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                {formatearFecha(ajuste.fecha)}
              </td>
              <td className="px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
                {ajuste.productoNombre}
              </td>
              <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                {ETIQUETAS_TIPO[ajuste.tipo] ?? ajuste.tipo}
              </td>
              <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                {formatearNumero(ajuste.cantidad)}
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                {formatearNumero(ajuste.stockResultante)}
              </td>
              <td className="px-5 py-4 text-sm text-muted sm:px-6">{ajuste.nota ?? "—"}</td>
            </tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
