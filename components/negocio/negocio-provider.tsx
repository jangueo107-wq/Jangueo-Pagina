"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AjusteInventario,
  Compra,
  EstadoNegocio,
  Gasto,
  Perdida,
  Producto,
  TipoCambioStock,
  VentaRegistro,
} from "@/types";
import {
  estadoInicial,
  fechaHoy,
  generarId,
  guardarEstado,
  ingresosMes,
  leerEstado,
  ventasHoy,
  ventasPorDiaDesdeRegistros,
  siguienteIdProducto,
} from "@/lib/almacen";
import { aplicarCambioStock } from "@/lib/stock-historial";

interface NegocioContextValue {
  listo: boolean;
  estado: EstadoNegocio;
  ventasHoyResumen: { cantidad: number; ingresos: number };
  ingresosMesActual: number;
  ventasPorDia: ReturnType<typeof ventasPorDiaDesdeRegistros>;
  actualizarProducto: (id: string, cambios: Partial<Producto>) => void;
  actualizarStock: (id: string, stock: number) => void;
  agregarProducto: (
    datos: Omit<Producto, "id" | "activo"> & { activo?: boolean }
  ) => string | null;
  venderProducto: (productoId: string, cantidad: number) => string | null;
  actualizarCantidadVenta: (ventaId: string, nuevaCantidad: number) => string | null;
  eliminarVenta: (ventaId: string) => void;
  agregarGasto: (datos: Omit<Gasto, "id">) => void;
  agregarCompra: (datos: Omit<Compra, "id">) => void;
  agregarPerdida: (
    datos: Omit<Perdida, "id" | "valorEstimado" | "producto"> & { valorEstimado?: number }
  ) => string | null;
  agregarAjuste: (
    datos: Omit<AjusteInventario, "id" | "stockResultante" | "fecha" | "productoNombre"> & {
      nota?: string;
    }
  ) => string | null;
  eliminarGasto: (id: string) => void;
  eliminarCompra: (id: string) => void;
  eliminarPerdida: (id: string) => void;
}

const NegocioContext = createContext<NegocioContextValue | null>(null);

function conStock(
  prev: EstadoNegocio,
  productoId: string,
  stockDespues: number,
  tipo: TipoCambioStock
): EstadoNegocio | null {
  return aplicarCambioStock(prev, productoId, stockDespues, tipo);
}

export function NegocioProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoNegocio>(estadoInicial);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setEstado(leerEstado());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    guardarEstado(estado);
  }, [estado, listo]);

  const persistir = useCallback((fn: (prev: EstadoNegocio) => EstadoNegocio) => {
    setEstado(fn);
  }, []);

  const actualizarProducto = useCallback((id: string, cambios: Partial<Producto>) => {
    persistir((prev) => ({
      ...prev,
      productos: prev.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    }));
  }, [persistir]);

  const actualizarStock = useCallback((id: string, stock: number) => {
    persistir((prev) => conStock(prev, id, stock, "inventario_manual") ?? prev);
  }, [persistir]);

  const agregarProducto = useCallback(
    (datos: Omit<Producto, "id" | "activo"> & { activo?: boolean }): string | null => {
      if (!datos.nombre.trim()) return "El nombre es obligatorio.";
      if (!datos.categoria.trim()) return "La categoría es obligatoria.";
      if (datos.precioCompra < 0 || datos.precioVenta < 0) {
        return "Los precios no pueden ser negativos.";
      }
      if (datos.precioVenta < datos.precioCompra) {
        return "El precio de venta debe ser mayor o igual al de compra.";
      }
      if (datos.stock < 0) return "El stock inicial no puede ser negativo.";

      persistir((prev) => {
        const id = siguienteIdProducto(prev.productos);
        const nuevo: Producto = {
          id,
          nombre: datos.nombre.trim(),
          categoria: datos.categoria.trim(),
          precioCompra: datos.precioCompra,
          precioVenta: datos.precioVenta,
          stock: 0,
          stockMinimo: datos.stockMinimo ?? 5,
          activo: datos.activo ?? true,
        };

        let siguiente: EstadoNegocio = {
          ...prev,
          productos: [...prev.productos, nuevo],
        };

        if (datos.stock > 0) {
          siguiente = conStock(siguiente, id, datos.stock, "inventario_manual") ?? siguiente;
        }

        return siguiente;
      });

      return null;
    },
    [persistir]
  );

  const venderProducto = useCallback((productoId: string, cantidad: number): string | null => {
    if (cantidad < 1) return "La cantidad debe ser al menos 1.";

    let error: string | null = null;

    persistir((prev) => {
      const producto = prev.productos.find((p) => p.id === productoId);
      if (!producto) {
        error = "Producto no encontrado.";
        return prev;
      }
      if (producto.stock < cantidad) {
        error = `Stock insuficiente (${producto.stock} disponibles).`;
        return prev;
      }

      const venta: VentaRegistro = {
        id: generarId("V"),
        fecha: fechaHoy(),
        productoId: producto.id,
        productoNombre: producto.nombre,
        categoria: producto.categoria,
        cantidad,
        precioUnitario: producto.precioVenta,
        total: producto.precioVenta * cantidad,
      };

      const conHistorial = conStock(prev, productoId, producto.stock - cantidad, "venta");
      if (!conHistorial) {
        error = "No se pudo actualizar el stock.";
        return prev;
      }

      return { ...conHistorial, ventas: [venta, ...prev.ventas] };
    });

    return error;
  }, [persistir]);

  const actualizarCantidadVenta = useCallback(
    (ventaId: string, nuevaCantidad: number): string | null => {
      if (nuevaCantidad < 1) return "La cantidad debe ser al menos 1.";

      let error: string | null = null;

      persistir((prev) => {
        const venta = prev.ventas.find((v) => v.id === ventaId);
        if (!venta) {
          error = "Venta no encontrada.";
          return prev;
        }

        const delta = nuevaCantidad - venta.cantidad;
        const producto = prev.productos.find((p) => p.id === venta.productoId);
        if (!producto) {
          error = "Producto asociado no encontrado.";
          return prev;
        }
        if (delta > 0 && producto.stock < delta) {
          error = `Stock insuficiente para aumentar (${producto.stock} disponibles).`;
          return prev;
        }

        const tipo: TipoCambioStock = delta === 0 ? "venta_ajuste" : delta > 0 ? "venta" : "venta_ajuste";
        const conHistorial = conStock(prev, venta.productoId, producto.stock - delta, tipo);
        if (!conHistorial) {
          error = "No se pudo actualizar el stock.";
          return prev;
        }

        return {
          ...conHistorial,
          ventas: conHistorial.ventas.map((v) =>
            v.id === ventaId
              ? {
                  ...v,
                  cantidad: nuevaCantidad,
                  total: v.precioUnitario * nuevaCantidad,
                }
              : v
          ),
        };
      });

      return error;
    },
    [persistir]
  );

  const eliminarVenta = useCallback((ventaId: string) => {
    persistir((prev) => {
      const venta = prev.ventas.find((v) => v.id === ventaId);
      if (!venta) return prev;

      const producto = prev.productos.find((p) => p.id === venta.productoId);
      if (!producto) return prev;

      const conHistorial = conStock(
        prev,
        venta.productoId,
        producto.stock + venta.cantidad,
        "venta_anulada"
      );
      if (!conHistorial) return prev;

      return {
        ...conHistorial,
        ventas: conHistorial.ventas.filter((v) => v.id !== ventaId),
      };
    });
  }, [persistir]);

  const agregarGasto = useCallback((datos: Omit<Gasto, "id">) => {
    persistir((prev) => ({
      ...prev,
      gastos: [{ ...datos, id: generarId("G") }, ...prev.gastos],
    }));
  }, [persistir]);

  const agregarCompra = useCallback((datos: Omit<Compra, "id">) => {
    persistir((prev) => ({
      ...prev,
      compras: [{ ...datos, id: generarId("C") }, ...prev.compras],
    }));
  }, [persistir]);

  const agregarPerdida = useCallback(
    (
      datos: Omit<Perdida, "id" | "valorEstimado" | "producto"> & { valorEstimado?: number }
    ): string | null => {
      let error: string | null = null;

      persistir((prev) => {
        const producto = prev.productos.find((p) => p.id === datos.productoId);
        if (!producto) {
          error = "Producto no encontrado.";
          return prev;
        }
        if (producto.stock < datos.cantidad) {
          error = `Stock insuficiente (${producto.stock} disponibles).`;
          return prev;
        }

        const valor = datos.valorEstimado ?? producto.precioCompra * datos.cantidad;
        const conHistorial = conStock(
          prev,
          datos.productoId,
          producto.stock - datos.cantidad,
          "perdida"
        );
        if (!conHistorial) {
          error = "No se pudo actualizar el stock.";
          return prev;
        }

        return {
          ...conHistorial,
          perdidas: [
            {
              ...datos,
              producto: producto.nombre,
              valorEstimado: valor,
              id: generarId("L"),
            },
            ...prev.perdidas,
          ],
        };
      });

      return error;
    },
    [persistir]
  );

  const agregarAjuste = useCallback(
    (
      datos: Omit<AjusteInventario, "id" | "stockResultante" | "fecha" | "productoNombre"> & {
        nota?: string;
      }
    ): string | null => {
      let error: string | null = null;

      persistir((prev) => {
        const producto = prev.productos.find((p) => p.id === datos.productoId);
        if (!producto) {
          error = "Producto no encontrado.";
          return prev;
        }

        if (datos.tipo !== "reconteo" && datos.cantidad < 1) {
          error = "La cantidad debe ser al menos 1.";
          return prev;
        }

        let stockResultante = producto.stock;
        let tipo: TipoCambioStock = "ajuste_entrada";

        if (datos.tipo === "entrada") {
          stockResultante += datos.cantidad;
          tipo = "ajuste_entrada";
        } else if (datos.tipo === "salida") {
          if (producto.stock < datos.cantidad) {
            error = `Stock insuficiente (${producto.stock} disponibles).`;
            return prev;
          }
          stockResultante -= datos.cantidad;
          tipo = "ajuste_salida";
        } else {
          stockResultante = datos.cantidad;
          tipo = "ajuste_reconteo";
        }

        const conHistorial = conStock(prev, datos.productoId, stockResultante, tipo);
        if (!conHistorial) {
          error = "No se pudo actualizar el stock.";
          return prev;
        }

        return {
          ...conHistorial,
          ajustes: [
            {
              id: generarId("A"),
              fecha: fechaHoy(),
              productoId: datos.productoId,
              productoNombre: producto.nombre,
              tipo: datos.tipo,
              cantidad: datos.cantidad,
              stockResultante: Math.max(0, stockResultante),
              nota: datos.nota,
            },
            ...prev.ajustes,
          ],
        };
      });

      return error;
    },
    [persistir]
  );

  const eliminarPerdida = useCallback((id: string) => {
    persistir((prev) => {
      const perdida = prev.perdidas.find((p) => p.id === id);
      if (!perdida) return prev;

      const producto = prev.productos.find((p) => p.id === perdida.productoId);
      if (!producto) return prev;

      const conHistorial = conStock(
        prev,
        perdida.productoId,
        producto.stock + perdida.cantidad,
        "perdida_anulada"
      );
      if (!conHistorial) return prev;

      return {
        ...conHistorial,
        perdidas: conHistorial.perdidas.filter((p) => p.id !== id),
      };
    });
  }, [persistir]);

  const eliminarGasto = useCallback((id: string) => {
    persistir((prev) => ({ ...prev, gastos: prev.gastos.filter((g) => g.id !== id) }));
  }, [persistir]);

  const eliminarCompra = useCallback((id: string) => {
    persistir((prev) => ({ ...prev, compras: prev.compras.filter((c) => c.id !== id) }));
  }, [persistir]);

  const ventasPorDia = useMemo(() => ventasPorDiaDesdeRegistros(estado.ventas), [estado.ventas]);
  const ventasHoyResumen = useMemo(() => ventasHoy(estado), [estado]);
  const ingresosMesActual = useMemo(() => ingresosMes(estado), [estado]);

  const value: NegocioContextValue = {
    listo,
    estado,
    ventasHoyResumen,
    ingresosMesActual,
    ventasPorDia,
    actualizarProducto,
    actualizarStock,
    agregarProducto,
    venderProducto,
    actualizarCantidadVenta,
    eliminarVenta,
    agregarGasto,
    agregarCompra,
    agregarPerdida,
    agregarAjuste,
    eliminarGasto,
    eliminarCompra,
    eliminarPerdida,
  };

  return <NegocioContext.Provider value={value}>{children}</NegocioContext.Provider>;
}

export function useNegocio(): NegocioContextValue {
  const ctx = useContext(NegocioContext);
  if (!ctx) throw new Error("useNegocio debe usarse dentro de NegocioProvider");
  return ctx;
}
