import type { EstadoNegocio } from "@/types";

export interface ProductoVendido {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface IndicadoresNegocio {
  ingresosVentas: number;
  unidadesVendidas: number;
  costoVentas: number;
  utilidadBruta: number;
  totalGastos: number;
  totalPerdidas: number;
  utilidadNeta: number;
  margenBrutoPct: number;
  margenNetoPct: number;
  ticketPromedio: number;
  stockBajo: number;
  agotados: number;
  productosMasVendidos: ProductoVendido[];
}

function mapaPrecioCompra(productos: EstadoNegocio["productos"]) {
  return new Map(productos.map((p) => [p.id, p.precioCompra]));
}

export function calcularIndicadores(estado: EstadoNegocio): IndicadoresNegocio {
  const preciosCompra = mapaPrecioCompra(estado.productos);

  const ingresosVentas = estado.ventas.reduce((acc, v) => acc + v.total, 0);
  const unidadesVendidas = estado.ventas.reduce((acc, v) => acc + v.cantidad, 0);

  const costoVentas = estado.ventas.reduce((acc, v) => {
    const compra = preciosCompra.get(v.productoId) ?? 0;
    return acc + compra * v.cantidad;
  }, 0);

  const totalGastos = estado.gastos.reduce((acc, g) => acc + g.monto, 0);
  const totalPerdidas = estado.perdidas.reduce((acc, p) => acc + p.valorEstimado, 0);

  const utilidadBruta = ingresosVentas - costoVentas;
  const utilidadNeta = utilidadBruta - totalGastos - totalPerdidas;

  const margenBrutoPct = ingresosVentas > 0 ? (utilidadBruta / ingresosVentas) * 100 : 0;
  const margenNetoPct = ingresosVentas > 0 ? (utilidadNeta / ingresosVentas) * 100 : 0;
  const ticketPromedio = unidadesVendidas > 0 ? Math.round(ingresosVentas / unidadesVendidas) : 0;

  const stockBajo = estado.productos.filter(
    (p) => p.stock > 0 && p.stock <= p.stockMinimo
  ).length;
  const agotados = estado.productos.filter((p) => p.stock === 0).length;

  const conteo = new Map<string, ProductoVendido>();
  for (const venta of estado.ventas) {
    const existente = conteo.get(venta.productoId);
    if (existente) {
      existente.cantidad += venta.cantidad;
      existente.ingresos += venta.total;
    } else {
      conteo.set(venta.productoId, {
        nombre: venta.productoNombre,
        cantidad: venta.cantidad,
        ingresos: venta.total,
      });
    }
  }

  const productosMasVendidos = Array.from(conteo.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return {
    ingresosVentas,
    unidadesVendidas,
    costoVentas,
    utilidadBruta,
    totalGastos,
    totalPerdidas,
    utilidadNeta,
    margenBrutoPct,
    margenNetoPct,
    ticketPromedio,
    stockBajo,
    agotados,
    productosMasVendidos,
  };
}
