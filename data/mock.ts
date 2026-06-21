import type { Compra, ConfiguracionNegocio, Gasto, Perdida } from "@/types";
import { nombreNegocioDefault } from "@/lib/navegacion";

export const compras: Compra[] = [
  {
    id: "C-001",
    fecha: "2026-06-18",
    proveedor: "Distribuidora Cervezas",
    producto: "Poker y Light",
    items: 120,
    total: 4500000,
    estado: "recibida",
  },
  {
    id: "C-002",
    fecha: "2026-06-15",
    proveedor: "Gaseosas del Norte",
    items: 80,
    total: 2800000,
    estado: "recibida",
  },
];

export const gastos: Gasto[] = [
  {
    id: "G-001",
    fecha: "2026-06-20",
    concepto: "Arriendo local",
    categoria: "Operación",
    monto: 2500000,
  },
  {
    id: "G-002",
    fecha: "2026-06-18",
    concepto: "Servicios públicos",
    categoria: "Operación",
    monto: 380000,
  },
];

export const perdidas: Perdida[] = [
  {
    id: "L-001",
    fecha: "2026-06-19",
    productoId: "P-001",
    producto: "Poker 330",
    cantidad: 2,
    motivo: "Botellas rotas",
    valorEstimado: 8000,
  },
];

export const configuracionDefault: ConfiguracionNegocio = {
  nombreNegocio: nombreNegocioDefault,
  moneda: "COP",
  zonaHoraria: "America/Bogota",
  notificaciones: true,
  temaOscuro: false,
};

export const reportesDisponibles = [
  {
    id: "ventas-mes",
    titulo: "Reporte de ventas mensual",
    descripcion: "Resumen de ventas, ingresos y ticket promedio del mes.",
    formato: "PDF / Excel",
  },
  {
    id: "inventario",
    titulo: "Reporte de inventario",
    descripcion: "Estado actual de stock, mínimos y productos inactivos.",
    formato: "PDF / Excel",
  },
  {
    id: "financiero",
    titulo: "Reporte financiero",
    descripcion: "Compras, gastos, pérdidas y balance estimado.",
    formato: "PDF / Excel",
  },
  {
    id: "productos",
    titulo: "Catálogo de productos",
    descripcion: "Listado completo de productos con precios y categorías.",
    formato: "PDF / Excel",
  },
];
