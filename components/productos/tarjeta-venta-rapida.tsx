"use client";

import { useState } from "react";
import type { Producto } from "@/types";
import { useNegocio } from "@/components/negocio/negocio-provider";
import { CampoNumero, MensajeFeedback } from "@/components/ui/campo-numero";
import { StockBadge } from "@/components/ui/stock-badge";
import { Tarjeta } from "@/components/ui/primitives";
import { parsearEntero } from "@/lib/almacen";
import { MONEDA, formatearMoneda } from "@/lib/formato";

interface TarjetaVentaRapidaProps {
  producto: Producto;
}

export function TarjetaVentaRapida({ producto }: TarjetaVentaRapidaProps) {
  const { venderProducto } = useNegocio();
  const [cantidad, setCantidad] = useState("1");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error">("ok");

  function vender() {
    const qty = parsearEntero(cantidad, 1);
    if (qty === null) {
      setTipoMensaje("error");
      setMensaje("Cantidad inválida.");
      return;
    }

    const error = venderProducto(producto.id, qty);
    if (error) {
      setTipoMensaje("error");
      setMensaje(error);
      return;
    }

    setTipoMensaje("ok");
    setMensaje(`Vendido ×${qty}`);
    setCantidad("1");
  }

  const agotado = producto.stock === 0;
  const qtyPreview = parsearEntero(cantidad, 1) ?? 1;
  const totalVenta = producto.precioVenta * qtyPreview;

  return (
    <Tarjeta className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{producto.nombre}</p>
          <p className="text-xs text-muted">{producto.categoria}</p>
        </div>
        <StockBadge stock={producto.stock} minimo={producto.stockMinimo} />
      </div>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <p className="text-xs font-medium text-muted">Precio de venta ({MONEDA})</p>
        <p className="mt-0.5 text-xl font-semibold text-accent">
          {formatearMoneda(producto.precioVenta)}
        </p>
      </div>

      <div className="flex items-end gap-2 border-t border-border pt-3">
        <CampoNumero etiqueta="Cant." valor={cantidad} onChange={setCantidad} ancho="sm" />
        <button
          type="button"
          onClick={vender}
          disabled={agotado}
          className="flex flex-1 items-center justify-center rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Vender · {formatearMoneda(totalVenta)}
        </button>
      </div>

      <MensajeFeedback mensaje={mensaje} tipo={tipoMensaje} />
    </Tarjeta>
  );
}
