import { Suspense } from "react";
import { HistorialStockContenido } from "@/components/inventario/historial-stock-contenido";

export default function HistorialStockPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando historial…</p>}>
      <HistorialStockContenido />
    </Suspense>
  );
}
