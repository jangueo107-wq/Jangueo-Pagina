"use client";

import type { Producto } from "@/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useNegocio } from "@/components/negocio/negocio-provider";
import {
  BarraFiltrosProductos,
  ModalNuevoProducto,
  filtrarProductos,
} from "@/components/productos/modal-nuevo-producto";
import { DataTable } from "@/components/ui/data-table";
import { CampoNumero } from "@/components/ui/campo-numero";
import { StockBadge } from "@/components/ui/stock-badge";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { categoriasProducto } from "@/data/productos";
import { parsearEntero, parsearMoneda } from "@/lib/almacen";
import { cn, formatearMoneda, formatearNumero } from "@/lib/formato";

export function InventarioContenido() {
  const { estado, listo, actualizarStock, actualizarProducto } = useNegocio();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const categorias = useMemo(() => {
    const delEstado = estado.productos.map((p) => p.categoria);
    return [...new Set([...categoriasProducto, ...delEstado])];
  }, [estado.productos]);

  const productosFiltrados = useMemo(
    () => filtrarProductos(estado.productos, busqueda, categoriaActiva, soloStockBajo),
    [estado.productos, busqueda, categoriaActiva, soloStockBajo]
  );

  if (!listo) return <p className="text-sm text-muted">Cargando inventario…</p>;

  const agotados = estado.productos.filter((p) => p.stock === 0).length;
  const stockBajo = estado.productos.filter(
    (p) => p.stock > 0 && p.stock <= p.stockMinimo
  ).length;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          titulo="Inventario"
          descripcion="Edita stock, stock mínimo y precios de compra/venta. Usa Ajustes para entradas, salidas o reconteos."
          acciones={
            <div className="flex flex-wrap gap-2">
              <Boton variante="secundario" onClick={() => setModalAbierto(true)}>
                Nuevo producto
              </Boton>
              <Link
                href="/ajustes"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Ajustes de inventario
              </Link>
              <Link
                href="/historial-stock"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Historial de stock
              </Link>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Tarjeta>
            <p className="text-sm text-muted">Productos</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatearNumero(estado.productos.length)}
            </p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-sm text-muted">Stock bajo</p>
            <p className="mt-2 text-2xl font-semibold text-amber-600">
              {formatearNumero(stockBajo)}
            </p>
          </Tarjeta>
          <Tarjeta>
            <p className="text-sm text-muted">Agotados</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">
              {formatearNumero(agotados)}
            </p>
          </Tarjeta>
        </div>

        <BarraFiltrosProductos
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          categoriaActiva={categoriaActiva}
          onCategoriaChange={setCategoriaActiva}
          soloStockBajo={soloStockBajo}
          onSoloStockBajoChange={setSoloStockBajo}
          categorias={categorias}
        />

        <DataTable
          encabezados={[
            "Producto",
            "Stock",
            "Mínimo",
            "Compra (COP)",
            "Venta (COP)",
            "Estado",
            "Historial",
          ]}
        >
          {productosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted sm:px-6">
                No hay productos con esos filtros.
              </td>
            </tr>
          ) : (
            productosFiltrados.map((producto) => (
              <FilaInventario
                key={producto.id}
                producto={producto}
                onGuardarStock={actualizarStock}
                onActualizarProducto={actualizarProducto}
              />
            ))
          )}
        </DataTable>
      </div>

      <ModalNuevoProducto abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
    </>
  );
}

function FilaInventario({
  producto,
  onGuardarStock,
  onActualizarProducto,
}: {
  producto: Producto;
  onGuardarStock: (id: string, stock: number) => void;
  onActualizarProducto: (id: string, cambios: Partial<Producto>) => void;
}) {
  const [stock, setStock] = useState(String(producto.stock));
  const [minimo, setMinimo] = useState(String(producto.stockMinimo));
  const [compra, setCompra] = useState(String(producto.precioCompra));
  const [venta, setVenta] = useState(String(producto.precioVenta));

  useEffect(() => {
    setStock(String(producto.stock));
    setMinimo(String(producto.stockMinimo));
    setCompra(String(producto.precioCompra));
    setVenta(String(producto.precioVenta));
  }, [producto.stock, producto.stockMinimo, producto.precioCompra, producto.precioVenta]);

  function guardarStock() {
    const valor = parsearEntero(stock, 0);
    if (valor !== null) onGuardarStock(producto.id, valor);
  }

  function guardarPreciosYMinimo() {
    const precioCompra = parsearMoneda(compra);
    const precioVenta = parsearMoneda(venta);
    const stockMinimo = parsearEntero(minimo, 0);
    if (precioCompra === null || precioVenta === null || stockMinimo === null) return;
    if (precioVenta < precioCompra) return;
    onActualizarProducto(producto.id, { precioCompra, precioVenta, stockMinimo });
  }

  const agotado = producto.stock === 0;
  const bajo = producto.stock > 0 && producto.stock <= producto.stockMinimo;

  return (
    <tr
      className={cn(
        "hover:bg-slate-50/80",
        agotado && "bg-red-50/40",
        bajo && !agotado && "bg-amber-50/40"
      )}
    >
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <p className="text-sm font-medium text-slate-900">{producto.nombre}</p>
        <p className="text-xs text-muted">{producto.categoria}</p>
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <CampoNumero valor={stock} onChange={setStock} onBlur={guardarStock} ancho="sm" />
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <CampoNumero valor={minimo} onChange={setMinimo} onBlur={guardarPreciosYMinimo} ancho="sm" />
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <CampoNumero valor={compra} onChange={setCompra} onBlur={guardarPreciosYMinimo} ancho="md" />
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <CampoNumero valor={venta} onChange={setVenta} onBlur={guardarPreciosYMinimo} ancho="md" />
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-1">
          <StockBadge stock={producto.stock} minimo={producto.stockMinimo} />
          <span
            className={cn(
              "text-xs font-medium",
              agotado && "text-red-600",
              bajo && !agotado && "text-amber-600",
              !agotado && !bajo && "text-emerald-600"
            )}
          >
            {agotado ? "Agotado" : bajo ? "Stock bajo" : "OK"}
          </span>
          <span className="text-xs text-muted">Margen {formatearMoneda(producto.precioVenta - producto.precioCompra)}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm sm:px-6">
        <Link
          href={`/historial-stock?producto=${encodeURIComponent(producto.id)}`}
          className="font-medium text-accent hover:underline"
        >
          Ver movimientos
        </Link>
      </td>
    </tr>
  );
}
