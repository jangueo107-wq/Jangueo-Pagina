import { NegocioProvider } from "@/components/negocio/negocio-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NegocioProvider>
      <DashboardShell>{children}</DashboardShell>
    </NegocioProvider>
  );
}
