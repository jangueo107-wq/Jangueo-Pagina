import { Suspense } from "react";
import { AjustesContenido } from "@/components/ajustes/ajustes-contenido";

export default function AjustesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando ajustes…</p>}>
      <AjustesContenido />
    </Suspense>
  );
}
