export interface Metrica {
  id: string;
  titulo: string;
  valor: number;
  variacion?: number;
  formato: "moneda" | "numero" | "porcentaje";
  descripcion?: string;
  /** Color del valor principal */
  tono?: "neutral" | "positivo" | "negativo" | "advertencia";
}

export interface VentaRegistro {
  id: string;
  fecha: string;
  productoId: string;
  productoNombre: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  notaCompra?: string;
}

export interface PuntoReporte {
  etiqueta: string;
  ventas: number;
  ingresos: number;
}

export type PeriodoReporte = "dia" | "semana" | "mes";

export interface Compra {
  id: string;
  fecha: string;
  proveedor: string;
  producto?: string;
  items: number;
  total: number;
  estado: "recibida" | "pendiente" | "cancelada";
}

export interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string;
  monto: number;
}

export interface Perdida {
  id: string;
  fecha: string;
  productoId: string;
  producto: string;
  cantidad: number;
  motivo: string;
  valorEstimado: number;
}

export interface AjusteInventario {
  id: string;
  fecha: string;
  productoId: string;
  productoNombre: string;
  tipo: "entrada" | "salida" | "reconteo";
  cantidad: number;
  stockResultante: number;
  nota?: string;
}

export type TipoCambioStock =
  | "venta"
  | "venta_anulada"
  | "venta_ajuste"
  | "inventario_manual"
  | "ajuste_entrada"
  | "ajuste_salida"
  | "ajuste_reconteo"
  | "perdida"
  | "perdida_anulada";

export interface HistorialStock {
  id: string;
  fecha: string;
  hora: string;
  productoId: string;
  productoNombre: string;
  stockAntes: number;
  stockDespues: number;
  tipo: TipoCambioStock;
}

export interface VentaPorDia {
  fecha: string;
  ventas: number;
  ingresos: number;
}

export interface ConfiguracionNegocio {
  nombreNegocio: string;
  moneda: "COP";
  zonaHoraria: string;
  notificaciones: boolean;
  temaOscuro: boolean;
}

export interface NavItem {
  titulo: string;
  href: string;
  icono: string;
}

export interface EstadoNegocio {
  productos: Producto[];
  ventas: VentaRegistro[];
  gastos: Gasto[];
  compras: Compra[];
  perdidas: Perdida[];
  ajustes: AjusteInventario[];
  historialStock: HistorialStock[];
}

export type EstadoOperacion = "completada" | "pendiente" | "cancelada" | "recibida";
