"use client";

import { useMemo, useState } from "react";
import { useNegocio } from "@/components/negocio/negocio-provider";
import {
  BarraFiltrosProductos,
  ModalNuevoProducto,
  filtrarProductos,
} from "@/components/productos/modal-nuevo-producto";
import { TarjetaVentaRapida } from "@/components/productos/tarjeta-venta-rapida";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { categoriasProducto } from "@/data/productos";

export function ProductosContenido() {
  const { estado, listo } = useNegocio();
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

  if (!listo) {
    return <p className="text-sm text-muted">Cargando productos…</p>;
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          titulo="Productos"
          descripcion="Venta rápida: elige producto, cantidad y vende. Stock y precios se gestionan en Inventario."
          acciones={
            <Boton onClick={() => setModalAbierto(true)}>Nuevo producto</Boton>
          }
        />

        <BarraFiltrosProductos
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          categoriaActiva={categoriaActiva}
          onCategoriaChange={setCategoriaActiva}
          soloStockBajo={soloStockBajo}
          onSoloStockBajoChange={setSoloStockBajo}
          categorias={categorias}
        />

        {productosFiltrados.length === 0 ? (
          <Tarjeta className="text-center text-sm text-muted">
            No hay productos con esos filtros.{" "}
            <button
              type="button"
              className="font-medium text-accent underline-offset-2 hover:underline"
              onClick={() => {
                setBusqueda("");
                setCategoriaActiva("Todas");
                setSoloStockBajo(false);
              }}
            >
              Limpiar filtros
            </button>
          </Tarjeta>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {productosFiltrados.map((producto) => (
              <TarjetaVentaRapida key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </div>

      <ModalNuevoProducto abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
    </>
  );
}
