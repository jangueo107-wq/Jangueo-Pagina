import type { EstadoNegocio, HistorialStock, TipoCambioStock } from "@/types";
import { generarId } from "@/lib/almacen";

const ETIQUETAS_TIPO: Record<TipoCambioStock, string> = {
  venta: "Venta",
  venta_anulada: "Anulación de venta",
  venta_ajuste: "Ajuste de venta",
  inventario_manual: "Edición manual",
  ajuste_entrada: "Ajuste — entrada",
  ajuste_salida: "Ajuste — salida",
  ajuste_reconteo: "Ajuste — reconteo",
  perdida: "Pérdida",
  perdida_anulada: "Anulación de pérdida",
};

export function etiquetaTipoCambioStock(tipo: TipoCambioStock): string {
  return ETIQUETAS_TIPO[tipo];
}

function ahoraLocal() {
  const d = new Date();
  return {
    fecha: d.toISOString().slice(0, 10),
    hora: d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };
}

export function crearRegistroStock(
  productoId: string,
  productoNombre: string,
  stockAntes: number,
  stockDespues: number,
  tipo: TipoCambioStock
): HistorialStock {
  const { fecha, hora } = ahoraLocal();
  return {
    id: generarId("HS"),
    fecha,
    hora,
    productoId,
    productoNombre,
    stockAntes,
    stockDespues: Math.max(0, stockDespues),
    tipo,
  };
}

const MAX_HISTORIAL = 500;

/** Actualiza stock de un producto y registra el cambio en el historial */
export function aplicarCambioStock(
  estado: EstadoNegocio,
  productoId: string,
  stockDespues: number,
  tipo: TipoCambioStock
): EstadoNegocio | null {
  const producto = estado.productos.find((p) => p.id === productoId);
  if (!producto) return null;

  const stockFinal = Math.max(0, stockDespues);
  const stockAntes = producto.stock;

  const productos =
    stockAntes === stockFinal
      ? estado.productos
      : estado.productos.map((p) =>
          p.id === productoId ? { ...p, stock: stockFinal } : p
        );

  const historialStock =
    stockAntes === stockFinal
      ? estado.historialStock
      : [
          crearRegistroStock(productoId, producto.nombre, stockAntes, stockFinal, tipo),
          ...estado.historialStock,
        ].slice(0, MAX_HISTORIAL);

  return { ...estado, productos, historialStock };
}
