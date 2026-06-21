"use client";

import { useState } from "react";
import {
  CampoSelect,
  CampoTexto,
  FormularioRegistro,
} from "@/components/negocio/formulario-registro";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { CampoNumero } from "@/components/ui/campo-numero";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { StockBadge } from "@/components/ui/stock-badge";
import { fechaHoy, parsearEntero } from "@/lib/almacen";
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/formato";

export function PerdidasContenido() {
  const { estado, listo, agregarPerdida, eliminarPerdida } = useNegocio();
  const [fecha, setFecha] = useState(fechaHoy());
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [motivo, setMotivo] = useState("");

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  const total = estado.perdidas.reduce((acc, p) => acc + p.valorEstimado, 0);
  const opcionesProducto = estado.productos.map((p) => ({
    valor: p.id,
    etiqueta: p.nombre,
  }));

  const productoSeleccionado = estado.productos.find(
    (p) => p.id === (productoId || opcionesProducto[0]?.valor)
  );

  return (
    <div className="space-y-6">
      <PageHeader titulo="Pérdidas" descripcion="Registra mermas y reduce stock automáticamente." />

      <Tarjeta className="max-w-sm">
        <p className="text-sm text-muted">Valor estimado acumulado</p>
        <p className="mt-2 text-2xl font-semibold text-red-600">{formatearMoneda(total)}</p>
      </Tarjeta>

      <FormularioRegistro
        titulo="Registrar pérdida"
        onSubmit={() => {
          const qty = parsearEntero(cantidad, 1);
          if (!productoId) return "Selecciona un producto.";
          if (!motivo.trim()) return "Indica el motivo.";
          if (qty === null) return "Cantidad inválida.";
          return agregarPerdida({
            fecha,
            productoId,
            cantidad: qty,
            motivo: motivo.trim(),
          });
        }}
        onExito={() => {
          setMotivo("");
          setCantidad("1");
        }}
      >
        <CampoTexto etiqueta="Fecha" type="date" valor={fecha} onChange={setFecha} />
        <CampoSelect
          etiqueta="Producto"
          valor={productoId || opcionesProducto[0]?.valor || ""}
          onChange={setProductoId}
          opciones={
            opcionesProducto.length
              ? opcionesProducto
              : [{ valor: "", etiqueta: "Sin productos" }]
          }
        />
        {productoSeleccionado ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            Stock disponible:
            <StockBadge
              stock={productoSeleccionado.stock}
              minimo={productoSeleccionado.stockMinimo}
            />
          </div>
        ) : null}
        <CampoNumero etiqueta="Cantidad" valor={cantidad} onChange={setCantidad} ancho="full" />
        <CampoTexto etiqueta="Motivo" valor={motivo} onChange={setMotivo} required />
      </FormularioRegistro>

      <DataTable
        encabezados={["Fecha", "Producto", "Cantidad", "Motivo", "Valor", ""]}
      >
        {estado.perdidas.map((perdida) => (
          <tr key={perdida.id} className="hover:bg-slate-50/80">
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
              {formatearFecha(perdida.fecha)}
            </td>
            <td className="px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
              {perdida.producto}
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
              {formatearNumero(perdida.cantidad)}
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">{perdida.motivo}</td>
            <td className="px-5 py-4 text-sm font-semibold text-red-600 sm:px-6">
              {formatearMoneda(perdida.valorEstimado)}
            </td>
            <td className="px-5 py-4 sm:px-6">
              <Boton variante="fantasma" onClick={() => eliminarPerdida(perdida.id)}>
                Quitar
              </Boton>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
