"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar, useSidebar } from "@/components/layout/sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebar = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar abierta={sidebar.abierta} onCerrar={sidebar.cerrar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={sidebar.alternar} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
