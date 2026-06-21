"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader, Tarjeta } from "@/components/ui/primitives";
import { etiquetaTipoCambioStock } from "@/lib/stock-historial";
import { cn, formatearFechaHora, formatearNumero } from "@/lib/formato";

export function HistorialStockContenido() {
  const searchParams = useSearchParams();
  const productoIdUrl = searchParams.get("producto") ?? "";
  const { estado, listo } = useNegocio();
  const [filtroTexto, setFiltroTexto] = useState("");

  const productoFiltrado = useMemo(
    () => (productoIdUrl ? estado.productos.find((p) => p.id === productoIdUrl) : undefined),
    [estado.productos, productoIdUrl]
  );

  const registros = useMemo(() => {
    let lista = estado.historialStock;

    if (productoIdUrl) {
      lista = lista.filter((r) => r.productoId === productoIdUrl);
    }

    const q = filtroTexto.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (r) =>
          r.productoNombre.toLowerCase().includes(q) ||
          etiquetaTipoCambioStock(r.tipo).toLowerCase().includes(q)
      );
    }

    return lista;
  }, [estado.historialStock, productoIdUrl, filtroTexto]);

  const productosConMovimientos = useMemo(() => {
    const ids = new Set(estado.historialStock.map((r) => r.productoId));
    return estado.productos.filter((p) => ids.has(p.id)).slice(0, 12);
  }, [estado.historialStock, estado.productos]);

  if (!listo) return <p className="text-sm text-muted">Cargando historial…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Historial de stock"
        descripcion="Cada cambio de inventario con fecha, hora y tipo de movimiento."
      />

      {productoFiltrado ? (
        <Tarjeta className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">Filtrando por producto</p>
            <p className="text-lg font-semibold text-slate-900">{productoFiltrado.nombre}</p>
          </div>
          <Link href="/historial-stock" className="text-sm font-medium text-accent hover:underline">
            Ver todos los productos
          </Link>
        </Tarjeta>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta>
          <p className="text-sm text-muted">Movimientos {productoFiltrado ? "del producto" : "totales"}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatearNumero(registros.length)}
          </p>
        </Tarjeta>
        <Tarjeta>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Buscar producto o tipo</span>
            <input
              type="search"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Ej. Poker, venta, ajuste…"
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
        </Tarjeta>
      </div>

      {!productoIdUrl && productosConMovimientos.length > 0 ? (
        <Tarjeta>
          <p className="text-sm font-medium text-slate-700">Acceso rápido por producto</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {productosConMovimientos.map((p) => (
              <Link
                key={p.id}
                href={`/historial-stock?producto=${encodeURIComponent(p.id)}`}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs font-medium text-slate-600 hover:border-accent hover:text-accent"
                )}
              >
                {p.nombre}
              </Link>
            ))}
          </div>
        </Tarjeta>
      ) : null}

      {registros.length === 0 ? (
        <Tarjeta className="text-center text-sm text-muted">
          {estado.historialStock.length === 0
            ? "Aún no hay movimientos. Se registran al vender, editar inventario, ajustar o registrar pérdidas."
            : "No hay resultados para este filtro."}
        </Tarjeta>
      ) : (
        <DataTable
          encabezados={[
            "Fecha y hora",
            "Producto",
            "Tipo",
            "Antes",
            "Después",
            "Cambio",
          ]}
        >
          {registros.map((r) => {
            const delta = r.stockDespues - r.stockAntes;
            return (
              <tr key={r.id} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600 sm:px-6">
                  {formatearFechaHora(r.fecha, r.hora)}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-900 sm:px-6">
                  {productoIdUrl ? (
                    r.productoNombre
                  ) : (
                    <Link
                      href={`/historial-stock?producto=${encodeURIComponent(r.productoId)}`}
                      className="hover:text-accent hover:underline"
                    >
                      {r.productoNombre}
                    </Link>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600 sm:px-6">
                  {etiquetaTipoCambioStock(r.tipo)}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600 sm:px-6">
                  {formatearNumero(r.stockAntes)}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900 sm:px-6">
                  {formatearNumero(r.stockDespues)}
                </td>
                <td
                  className={
                    delta >= 0
                      ? "whitespace-nowrap px-5 py-3 text-sm font-medium text-emerald-600 sm:px-6"
                      : "whitespace-nowrap px-5 py-3 text-sm font-medium text-red-600 sm:px-6"
                  }
                >
                  {delta >= 0 ? "+" : ""}
                  {formatearNumero(delta)}
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </div>
  );
}
