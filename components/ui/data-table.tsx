import type { ReactNode } from "react";
import { Tarjeta } from "@/components/ui/primitives";

interface DataTableProps {
  titulo?: string;
  encabezados: string[];
  children: ReactNode;
  pie?: ReactNode;
}

export function DataTable({ titulo, encabezados, children, pie }: DataTableProps) {
  return (
    <Tarjeta className="overflow-hidden p-0">
      {titulo ? (
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-slate-50">
            <tr>
              {encabezados.map((encabezado) => (
                <th
                  key={encabezado}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted sm:px-6"
                >
                  {encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">{children}</tbody>
        </table>
      </div>
      {pie ? (
        <div className="border-t border-border bg-slate-50 px-5 py-3 sm:px-6">
          {pie}
        </div>
      ) : null}
    </Tarjeta>
  );
}

interface StatRowProps {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}

export function StatRow({ etiqueta, valor, destacado }: StatRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted">{etiqueta}</span>
      <span
        className={
          destacado
            ? "text-sm font-semibold text-slate-900"
            : "text-sm font-medium text-slate-700"
        }
      >
        {valor}
      </span>
    </div>
  );
}
