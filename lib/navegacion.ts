import type { NavItem } from "@/types";

export const nombreNegocioDefault = "Jangueo";

/** Menú lateral: operación → inventario → finanzas → preferencias */
export const navItems: NavItem[] = [
  { titulo: "Dashboard", href: "/dashboard", icono: "◫" },
  { titulo: "Productos", href: "/productos", icono: "▣" },
  { titulo: "Ventas", href: "/ventas", icono: "◈" },
  { titulo: "Inventario", href: "/inventario", icono: "▦" },
  { titulo: "Ajustes de inventario", href: "/ajustes", icono: "±" },
  { titulo: "Historial de stock", href: "/historial-stock", icono: "▤" },
  { titulo: "Compras", href: "/compras", icono: "◧" },
  { titulo: "Gastos", href: "/gastos", icono: "◪" },
  { titulo: "Pérdidas", href: "/perdidas", icono: "◬" },
  { titulo: "Estadísticas", href: "/estadisticas", icono: "◉" },
  { titulo: "Reportes", href: "/reportes", icono: "▥" },
  { titulo: "Ventas por día", href: "/ventas-por-dia", icono: "▧" },
  { titulo: "Configuración", href: "/configuracion", icono: "◎" },
];

export const claveConfiguracion = "dashboard-negocio-config";
