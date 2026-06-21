"use client";

import { Logo } from "@/components/ui/logo";
import { nombreNegocioDefault } from "@/lib/navegacion";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-accent/10 lg:hidden"
          aria-label="Abrir menú"
        >
          <span className="text-xl leading-none">☰</span>
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <Logo size={36} className="hidden sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {nombreNegocioDefault}
            </p>
            <p className="truncate text-xs text-muted">Gestión comercial · COP</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-accent/30 hover:text-accent sm:inline-flex"
        >
          Ayuda
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white shadow-sm shadow-accent/30">
          J
        </div>
      </div>
    </header>
  );
}
