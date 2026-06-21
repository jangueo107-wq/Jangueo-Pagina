import type {
  AjusteInventario,
  Compra,
  EstadoNegocio,
  Gasto,
  HistorialStock,
  Perdida,
  Producto,
  VentaPorDia,
  VentaRegistro,
} from "@/types";
import { productos as productosIniciales } from "@/data/productos";
import { compras as comprasIniciales, gastos as gastosIniciales, perdidas as perdidasIniciales } from "@/data/mock";

export const CLAVE_ALMACEN = "jangueo-negocio-v1";

function esProducto(valor: unknown): valor is Producto {
  if (!valor || typeof valor !== "object") return false;
  const p = valor as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.nombre === "string" &&
    typeof p.categoria === "string" &&
    typeof p.precioCompra === "number" &&
    typeof p.precioVenta === "number" &&
    typeof p.stock === "number" &&
    typeof p.stockMinimo === "number" &&
    typeof p.activo === "boolean"
  );
}

function esVenta(valor: unknown): valor is VentaRegistro {
  if (!valor || typeof valor !== "object") return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.fecha === "string" &&
    typeof v.productoId === "string" &&
    typeof v.cantidad === "number" &&
    typeof v.total === "number"
  );
}

function esGasto(valor: unknown): valor is Gasto {
  if (!valor || typeof valor !== "object") return false;
  const g = valor as Record<string, unknown>;
  return (
    typeof g.id === "string" &&
    typeof g.fecha === "string" &&
    typeof g.concepto === "string" &&
    typeof g.monto === "number"
  );
}

function esCompra(valor: unknown): valor is Compra {
  if (!valor || typeof valor !== "object") return false;
  const c = valor as Record<string, unknown>;
  return typeof c.id === "string" && typeof c.total === "number";
}

function esPerdida(valor: unknown): valor is Perdida {
  if (!valor || typeof valor !== "object") return false;
  const p = valor as Record<string, unknown>;
  return typeof p.id === "string" && typeof p.productoId === "string";
}

function esAjuste(valor: unknown): valor is AjusteInventario {
  if (!valor || typeof valor !== "object") return false;
  const a = valor as Record<string, unknown>;
  return typeof a.id === "string" && typeof a.tipo === "string";
}

function esHistorialStock(valor: unknown): valor is HistorialStock {
  if (!valor || typeof valor !== "object") return false;
  const h = valor as Record<string, unknown>;
  return (
    typeof h.id === "string" &&
    typeof h.fecha === "string" &&
    typeof h.hora === "string" &&
    typeof h.productoId === "string" &&
    typeof h.stockAntes === "number" &&
    typeof h.stockDespues === "number" &&
    typeof h.tipo === "string"
  );
}

function esEstadoNegocio(valor: unknown): valor is EstadoNegocio {
  if (!valor || typeof valor !== "object") return false;
  const e = valor as Record<string, unknown>;
  const historialOk =
    e.historialStock === undefined ||
    (Array.isArray(e.historialStock) && e.historialStock.every(esHistorialStock));

  return (
    Array.isArray(e.productos) &&
    e.productos.every(esProducto) &&
    Array.isArray(e.ventas) &&
    e.ventas.every(esVenta) &&
    Array.isArray(e.gastos) &&
    e.gastos.every(esGasto) &&
    Array.isArray(e.compras) &&
    e.compras.every(esCompra) &&
    Array.isArray(e.perdidas) &&
    e.perdidas.every(esPerdida) &&
    Array.isArray(e.ajustes) &&
    e.ajustes.every(esAjuste) &&
    historialOk
  );
}

function normalizarEstado(estado: EstadoNegocio): EstadoNegocio {
  return {
    ...estado,
    historialStock: estado.historialStock ?? [],
  };
}

export function estadoInicial(): EstadoNegocio {
  return {
    productos: productosIniciales,
    ventas: [],
    gastos: gastosIniciales,
    compras: comprasIniciales,
    perdidas: perdidasIniciales,
    ajustes: [],
    historialStock: [],
  };
}

export function leerEstado(): EstadoNegocio {
  if (typeof window === "undefined") return estadoInicial();

  const guardado = window.localStorage.getItem(CLAVE_ALMACEN);
  if (!guardado) return estadoInicial();

  try {
    const parsed: unknown = JSON.parse(guardado);
    return esEstadoNegocio(parsed) ? normalizarEstado(parsed) : estadoInicial();
  } catch {
    return estadoInicial();
  }
}

export function guardarEstado(estado: EstadoNegocio): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(estado));
}

export function generarId(prefijo: string): string {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Siguiente ID secuencial tipo P-001, P-038… */
export function siguienteIdProducto(productos: Producto[]): string {
  const numeros = productos
    .map((p) => {
      const coincidencia = /^P-(\d+)$/.exec(p.id);
      return coincidencia ? Number.parseInt(coincidencia[1], 10) : 0;
    })
    .filter((n) => n > 0);

  const siguiente = numeros.length ? Math.max(...numeros) + 1 : 1;
  return `P-${String(siguiente).padStart(3, "0")}`;
}

export function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parsearEntero(valor: string, minimo = 0): number | null {
  const limpio = valor.trim();
  if (!/^\d+$/.test(limpio)) return null;
  const numero = Number.parseInt(limpio, 10);
  if (!Number.isFinite(numero) || numero < minimo) return null;
  return numero;
}

export function parsearMoneda(valor: string, minimo = 0): number | null {
  const limpio = valor.trim().replace(/\./g, "").replace(/,/g, "");
  if (!/^\d+$/.test(limpio)) return null;
  const numero = Number.parseInt(limpio, 10);
  if (!Number.isFinite(numero) || numero < minimo) return null;
  return numero;
}

export function ventasPorDiaDesdeRegistros(ventas: VentaRegistro[]): VentaPorDia[] {
  const mapa = new Map<string, VentaPorDia>();

  for (const venta of ventas) {
    const existente = mapa.get(venta.fecha);
    if (existente) {
      existente.ventas += venta.cantidad;
      existente.ingresos += venta.total;
    } else {
      mapa.set(venta.fecha, {
        fecha: venta.fecha,
        ventas: venta.cantidad,
        ingresos: venta.total,
      });
    }
  }

  return Array.from(mapa.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function ventasHoy(estado: EstadoNegocio): { cantidad: number; ingresos: number } {
  const hoy = fechaHoy();
  const delDia = estado.ventas.filter((v) => v.fecha === hoy);
  return {
    cantidad: delDia.reduce((acc, v) => acc + v.cantidad, 0),
    ingresos: delDia.reduce((acc, v) => acc + v.total, 0),
  };
}

export function ingresosMes(estado: EstadoNegocio): number {
  const ahora = new Date();
  const mes = ahora.getMonth();
  const anio = ahora.getFullYear();

  return estado.ventas
    .filter((v) => {
      const f = new Date(`${v.fecha}T12:00:00`);
      return f.getMonth() === mes && f.getFullYear() === anio;
    })
    .reduce((acc, v) => acc + v.total, 0);
}
