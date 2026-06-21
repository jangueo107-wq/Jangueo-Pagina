"use client";

import { useEffect, useState } from "react";
import type { VentaRegistro } from "@/types";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { CampoNumero, MensajeFeedback } from "@/components/ui/campo-numero";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { parsearEntero } from "@/lib/almacen";
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/formato";

export function VentasContenido() {
  const { estado, listo, actualizarCantidadVenta, eliminarVenta, ventasHoyResumen } =
    useNegocio();

  if (!listo) return <p className="text-sm text-muted">Cargando ventas…</p>;

  const totalMes = estado.ventas.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Ventas"
        descripcion="Registro de ventas rápidas desde Productos. Ajusta cantidades aquí."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta>
          <p className="text-sm text-muted">Ventas hoy (unidades)</p>
          <p className="mt-2 text-2xl font-semibold text-accent">
            {formatearNumero(ventasHoyResumen.cantidad)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatearMoneda(ventasHoyResumen.ingresos)}
          </p>
        </Tarjeta>
        <Tarjeta>
          <p className="text-sm text-muted">Total registrado</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatearMoneda(totalMes)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatearNumero(estado.ventas.length)} movimientos
          </p>
        </Tarjeta>
      </div>

      {estado.ventas.length === 0 ? (
        <Tarjeta className="text-center text-sm text-muted">
          Aún no hay ventas. Usa el botón <strong>Vender</strong> en Productos para registrar
          la primera.
        </Tarjeta>
      ) : (
        <DataTable
          encabezados={[
            "Fecha",
            "Producto",
            "Categoría",
            "Cantidad",
            "Unitario",
            "Total",
            "",
          ]}
        >
          {estado.ventas.map((venta) => (
            <FilaVenta
              key={venta.id}
              venta={venta}
              onActualizar={actualizarCantidadVenta}
              onEliminar={eliminarVenta}
            />
          ))}
        </DataTable>
      )}
    </div>
  );
}

function FilaVenta({
  venta,
  onActualizar,
  onEliminar,
}: {
  venta: VentaRegistro;
  onActualizar: (id: string, cantidad: number) => string | null;
  onEliminar: (id: string) => void;
}) {
  const [cantidad, setCantidad] = useState(String(venta.cantidad));
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    setCantidad(String(venta.cantidad));
  }, [venta.cantidad]);

  function guardarCantidad() {
    const qty = parsearEntero(cantidad, 1);
    if (qty === null) {
      setMensaje("Cantidad inválida.");
      return;
    }
    const error = onActualizar(venta.id, qty);
    setMensaje(error ?? "Actualizado.");
  }

  return (
    <tr className="hover:bg-slate-50/80">
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
        {formatearFecha(venta.fecha)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
        {venta.productoNombre}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
        {venta.categoria}
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <CampoNumero valor={cantidad} onChange={setCantidad} onBlur={guardarCantidad} ancho="sm" />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
        {formatearMoneda(venta.precioUnitario)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
        {formatearMoneda(venta.total)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 sm:px-6">
        <Boton variante="fantasma" onClick={() => onEliminar(venta.id)}>
          Quitar
        </Boton>
        <MensajeFeedback mensaje={mensaje} tipo={mensaje?.includes("inválida") ? "error" : "ok"} />
      </td>
    </tr>
  );
}
