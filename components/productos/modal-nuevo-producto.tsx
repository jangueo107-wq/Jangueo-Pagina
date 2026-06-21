"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { CampoMoneda, CampoSelect, CampoTexto } from "@/components/negocio/formulario-registro";
import { CampoNumero, MensajeFeedback } from "@/components/ui/campo-numero";
import { Boton } from "@/components/ui/primitives";
import { categoriasProducto } from "@/data/productos";
import { parsearEntero, parsearMoneda } from "@/lib/almacen";
import { cn } from "@/lib/formato";

interface ModalNuevoProductoProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function ModalNuevoProducto({ abierto, onCerrar }: ModalNuevoProductoProps) {
  const { agregarProducto } = useNegocio();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(categoriasProducto[0] ?? "");
  const [categoriaNueva, setCategoriaNueva] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error">("ok");

  useEffect(() => {
    if (!abierto) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  function limpiar() {
    setNombre("");
    setCategoria(categoriasProducto[0] ?? "");
    setCategoriaNueva("");
    setPrecioCompra("");
    setPrecioVenta("");
    setStock("0");
    setStockMinimo("5");
    setMensaje(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const compra = parsearMoneda(precioCompra);
    const venta = parsearMoneda(precioVenta);
    const stockInicial = parsearEntero(stock, 0);
    const minimo = parsearEntero(stockMinimo, 0);

    if (compra === null || venta === null) {
      setTipoMensaje("error");
      setMensaje("Precios inválidos.");
      return;
    }
    if (stockInicial === null || minimo === null) {
      setTipoMensaje("error");
      setMensaje("Stock inválido.");
      return;
    }

    const catFinal =
      categoria === "__nueva__" ? categoriaNueva.trim() : categoria;

    const error = agregarProducto({
      nombre,
      categoria: catFinal,
      precioCompra: compra,
      precioVenta: venta,
      stock: stockInicial,
      stockMinimo: minimo,
    });

    if (error) {
      setTipoMensaje("error");
      setMensaje(error);
      return;
    }

    setTipoMensaje("ok");
    setMensaje("Producto creado.");
    limpiar();
    setTimeout(onCerrar, 400);
  }

  const opcionesCategoria = [
    ...categoriasProducto.map((c) => ({ valor: c, etiqueta: c })),
    { valor: "__nueva__", etiqueta: "Nueva categoría…" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCerrar}
        aria-label="Cerrar"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-nuevo-producto-titulo"
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-white p-6 shadow-xl"
      >
        <h2 id="modal-nuevo-producto-titulo" className="text-lg font-semibold text-slate-900">
          Nuevo producto
        </h2>
        <p className="mt-1 text-sm text-muted">
          Se guarda en tu navegador. Edita stock y precios después en Inventario.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <CampoTexto etiqueta="Nombre" valor={nombre} onChange={setNombre} required />
          <CampoSelect
            etiqueta="Categoría"
            valor={categoria}
            onChange={setCategoria}
            opciones={opcionesCategoria}
          />
          {categoria === "__nueva__" ? (
            <CampoTexto
              etiqueta="Nombre de la categoría"
              valor={categoriaNueva}
              onChange={setCategoriaNueva}
              required
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoMoneda etiqueta="Precio de compra (COP)" valor={precioCompra} onChange={setPrecioCompra} />
            <CampoMoneda etiqueta="Precio de venta (COP)" valor={precioVenta} onChange={setPrecioVenta} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero etiqueta="Stock inicial" valor={stock} onChange={setStock} ancho="full" />
            <CampoNumero
              etiqueta="Stock mínimo (opcional)"
              valor={stockMinimo}
              onChange={setStockMinimo}
              ancho="full"
            />
          </div>

          <MensajeFeedback mensaje={mensaje} tipo={tipoMensaje} />

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Boton type="button" variante="secundario" onClick={onCerrar}>
              Cancelar
            </Boton>
            <Boton type="submit">Crear producto</Boton>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Barra de filtros reutilizable en Productos e Inventario */
export function BarraFiltrosProductos({
  busqueda,
  onBusquedaChange,
  categoriaActiva,
  onCategoriaChange,
  soloStockBajo,
  onSoloStockBajoChange,
  categorias,
  className,
}: {
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  categoriaActiva: string;
  onCategoriaChange: (v: string) => void;
  soloStockBajo: boolean;
  onSoloStockBajoChange: (v: boolean) => void;
  categorias: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between", className)}>
      <label className="block flex-1 max-w-md">
        <span className="text-sm font-medium text-slate-700">Buscar</span>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Nombre o categoría…"
          className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <FiltroPill
          activa={categoriaActiva === "Todas"}
          onClick={() => onCategoriaChange("Todas")}
          etiqueta="Todas"
        />
        {categorias.map((cat) => (
          <FiltroPill
            key={cat}
            activa={categoriaActiva === cat}
            onClick={() => onCategoriaChange(cat)}
            etiqueta={cat}
          />
        ))}
        <FiltroPill
          activa={soloStockBajo}
          onClick={() => onSoloStockBajoChange(!soloStockBajo)}
          etiqueta="Stock bajo"
          tono="advertencia"
        />
      </div>
    </div>
  );
}

function FiltroPill({
  activa,
  onClick,
  etiqueta,
  tono,
}: {
  activa: boolean;
  onClick: () => void;
  etiqueta: string;
  tono?: "advertencia";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        activa && tono !== "advertencia" && "bg-accent text-white",
        activa && tono === "advertencia" && "bg-amber-500 text-white",
        !activa && "border border-border bg-white text-slate-600 hover:border-accent/40"
      )}
    >
      {etiqueta}
    </button>
  );
}

export function filtrarProductos<T extends { nombre: string; categoria: string; stock: number; stockMinimo: number }>(
  productos: T[],
  busqueda: string,
  categoriaActiva: string,
  soloStockBajo: boolean
): T[] {
  let lista = productos;

  if (categoriaActiva !== "Todas") {
    lista = lista.filter((p) => p.categoria === categoriaActiva);
  }

  if (soloStockBajo) {
    lista = lista.filter((p) => p.stock > 0 && p.stock <= p.stockMinimo);
  }

  const q = busqueda.trim().toLowerCase();
  if (q) {
    lista = lista.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    );
  }

  return lista;
}
