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
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { fechaHoy, parsearMoneda } from "@/lib/almacen";
import { formatearFecha, formatearMoneda } from "@/lib/formato";

const CATEGORIAS_GASTO = ["Operación", "Marketing", "Logística", "Nómina", "Otros"];

export function GastosContenido() {
  const { estado, listo, agregarGasto, eliminarGasto } = useNegocio();
  const [fecha, setFecha] = useState(fechaHoy());
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_GASTO[0]);
  const [monto, setMonto] = useState("");

  if (!listo) return <p className="text-sm text-muted">Cargando…</p>;

  const total = estado.gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <div className="space-y-6">
      <PageHeader titulo="Gastos" descripcion="Registra y consulta egresos del negocio." />

      <Tarjeta className="max-w-sm">
        <p className="text-sm text-muted">Total gastos</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{formatearMoneda(total)}</p>
      </Tarjeta>

      <FormularioRegistro
        titulo="Nuevo gasto"
        onSubmit={() => {
          const valor = parsearMoneda(monto, 1);
          if (!concepto.trim()) return "Indica un concepto.";
          if (valor === null) return "Monto inválido.";
          agregarGasto({ fecha, concepto: concepto.trim(), categoria, monto: valor });
          setConcepto("");
          setMonto("");
          return null;
        }}
        onExito={() => setFecha(fechaHoy())}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto etiqueta="Fecha" type="date" valor={fecha} onChange={setFecha} required />
          <CampoSelect
            etiqueta="Categoría"
            valor={categoria}
            onChange={setCategoria}
            opciones={CATEGORIAS_GASTO.map((c) => ({ valor: c, etiqueta: c }))}
          />
        </div>
        <CampoTexto etiqueta="Concepto" valor={concepto} onChange={setConcepto} required />
        <CampoMoneda etiqueta="Monto (COP)" valor={monto} onChange={setMonto} />
      </FormularioRegistro>

      <DataTable encabezados={["Fecha", "Concepto", "Categoría", "Monto", ""]}>
        {estado.gastos.map((gasto) => (
          <tr key={gasto.id} className="hover:bg-slate-50/80">
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
              {formatearFecha(gasto.fecha)}
            </td>
            <td className="px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
              {gasto.concepto}
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">{gasto.categoria}</td>
            <td className="px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
              {formatearMoneda(gasto.monto)}
            </td>
            <td className="px-5 py-4 sm:px-6">
              <Boton variante="fantasma" onClick={() => eliminarGasto(gasto.id)}>
                Quitar
              </Boton>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
