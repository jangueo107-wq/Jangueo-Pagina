"use client";

import { useState } from "react";
import {
  CampoMoneda,
  CampoSelect,
  CampoTexto,
  FormularioRegistro,
} from "@/components/negocio/formulario-registro";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { DataTable } from "@/components/ui/data-table";
import { BadgeEstado, Boton, PageHeader } from "@/components/ui/primitives";
import { fechaHoy, parsearEntero, parsearMoneda } from "@/lib/almacen";
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/formato";

export function ComprasContenido() {
  const { estado, listo, agregarCompra, eliminarCompra } = useNegocio();
  const [fecha, setFecha] = useState(fechaHoy());
  const [proveedor, setProveedor] = useState("");
  const [producto, setProducto] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [estadoCompra, setEstadoCompra] = useState<"recibida" | "pendiente" | "cancelada">(
    "recibida"
  );

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Compras" descripcion="Registro de compras a proveedores." />

      <FormularioRegistro
        titulo="Registrar compra"
        onSubmit={() => {
          const cantItems = parsearEntero(items, 1);
          const monto = parsearMoneda(total, 1);
          if (!proveedor.trim()) return "Indica el proveedor.";
          if (cantItems === null) return "Cantidad de items inválida.";
          if (monto === null) return "Total inválido.";
          agregarCompra({
            fecha,
            proveedor: proveedor.trim(),
            producto: producto.trim() || undefined,
            items: cantItems,
            total: monto,
            estado: estadoCompra,
          });
          setProveedor("");
          setProducto("");
          setItems("");
          setTotal("");
          return null;
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto etiqueta="Fecha" type="date" valor={fecha} onChange={setFecha} />
          <CampoSelect
            etiqueta="Estado"
            valor={estadoCompra}
            onChange={(v) => setEstadoCompra(v as typeof estadoCompra)}
            opciones={[
              { valor: "recibida", etiqueta: "Recibida" },
              { valor: "pendiente", etiqueta: "Pendiente" },
              { valor: "cancelada", etiqueta: "Cancelada" },
            ]}
          />
        </div>
        <CampoTexto etiqueta="Proveedor" valor={proveedor} onChange={setProveedor} required />
        <CampoTexto etiqueta="Producto / referencia" valor={producto} onChange={setProducto} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto etiqueta="Cantidad items" valor={items} onChange={setItems} required />
          <CampoMoneda etiqueta="Total (COP)" valor={total} onChange={setTotal} />
        </div>
      </FormularioRegistro>

      <DataTable
        encabezados={["Fecha", "Proveedor", "Referencia", "Items", "Total", "Estado", ""]}
      >
        {estado.compras.map((compra) => (
          <tr key={compra.id} className="hover:bg-slate-50/80">
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
              {formatearFecha(compra.fecha)}
            </td>
            <td className="px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
              {compra.proveedor}
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
              {compra.producto ?? "—"}
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
              {formatearNumero(compra.items)}
            </td>
            <td className="px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
              {formatearMoneda(compra.total)}
            </td>
            <td className="px-5 py-4 sm:px-6">
              <BadgeEstado estado={compra.estado} />
            </td>
            <td className="px-5 py-4 sm:px-6">
              <Boton variante="fantasma" onClick={() => eliminarCompra(compra.id)}>
                Quitar
              </Boton>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
