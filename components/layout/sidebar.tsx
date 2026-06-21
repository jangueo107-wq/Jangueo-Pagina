"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { navItems, nombreNegocioDefault } from "@/lib/navegacion";
import { cn } from "@/lib/formato";

interface SidebarProps {
  abierta: boolean;
  onCerrar: () => void;
}

export function Sidebar({ abierta, onCerrar }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onCerrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-sidebar/80 backdrop-blur-sm transition-opacity lg:hidden",
          abierta ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCerrar}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-white transition-transform duration-200 lg:static lg:translate-x-0",
          abierta ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Logo size={44} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{nombreNegocioDefault}</p>
            <p className="truncate text-xs text-white/50">Panel de gestión</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const activo =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      activo
                        ? "bg-sidebar-active text-white ring-1 ring-accent/30"
                        : "text-white/70 hover:bg-sidebar-hover hover:text-white"
                    )}
                  >
                    <span className="w-5 text-center text-base leading-none opacity-80">
                      {item.icono}
                    </span>
                    {item.titulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-white/40">Datos guardados en el navegador</p>
        </div>
      </aside>
    </>
  );
}

export function useSidebar() {
  const [abierta, setAbierta] = useState(false);

  const abrir = useCallback(() => setAbierta(true), []);
  const cerrar = useCallback(() => setAbierta(false), []);
  const alternar = useCallback(() => setAbierta((prev) => !prev), []);

  return { abierta, abrir, cerrar, alternar };
}
