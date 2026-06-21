import { cn } from "@/lib/formato";

interface StockBadgeProps {
  stock: number;
  minimo?: number;
  className?: string;
}

export function StockBadge({ stock, minimo, className }: StockBadgeProps) {
  const agotado = stock === 0;
  const bajo = minimo !== undefined && stock > 0 && stock <= minimo;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        agotado && "bg-red-50 text-red-700 ring-1 ring-red-200",
        bajo && !agotado && "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        !agotado && !bajo && "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
        className
      )}
    >
      {agotado ? "Agotado" : `${stock} uds.`}
    </span>
  );
}
