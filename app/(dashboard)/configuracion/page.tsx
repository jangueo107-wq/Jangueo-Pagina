"use client";

import { useEffect, useState } from "react";
import { Boton, PageHeader, Tarjeta } from "@/components/ui/primitives";
import { configuracionDefault } from "@/data/mock";
import { claveConfiguracion } from "@/lib/navegacion";
import type { ConfiguracionNegocio } from "@/types";

function esConfiguracionValida(valor: unknown): valor is ConfiguracionNegocio {
  if (!valor || typeof valor !== "object") return false;

  const config = valor as Record<string, unknown>;

  return (
    typeof config.nombreNegocio === "string" &&
    config.moneda === "COP" &&
    typeof config.zonaHoraria === "string" &&
    typeof config.notificaciones === "boolean" &&
    typeof config.temaOscuro === "boolean"
  );
}

function leerConfiguracion(): ConfiguracionNegocio {
  if (typeof window === "undefined") return configuracionDefault;

  const guardado = window.localStorage.getItem(claveConfiguracion);
  if (!guardado) return configuracionDefault;

  try {
    const parsed: unknown = JSON.parse(guardado);
    return esConfiguracionValida(parsed) ? parsed : configuracionDefault;
  } catch {
    return configuracionDefault;
  }
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfiguracionNegocio>(configuracionDefault);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setConfig(leerConfiguracion());
  }, []);

  function actualizarCampo<K extends keyof ConfiguracionNegocio>(
    campo: K,
    valor: ConfiguracionNegocio[K]
  ) {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  function guardarConfiguracion() {
    window.localStorage.setItem(claveConfiguracion, JSON.stringify(config));
    setGuardado(true);
  }

  function restaurarDefault() {
    setConfig(configuracionDefault);
    window.localStorage.removeItem(claveConfiguracion);
    setGuardado(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Configuración"
        descripcion="Preferencias básicas del negocio. Se guardan en tu navegador."
        acciones={<Boton onClick={guardarConfiguracion}>Guardar cambios</Boton>}
      />

      {guardado ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Configuración guardada correctamente en localStorage.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta>
          <h2 className="text-base font-semibold text-slate-900">Datos del negocio</h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nombre del negocio</span>
              <input
                type="text"
                value={config.nombreNegocio}
                onChange={(e) => actualizarCampo("nombreNegocio", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Moneda</span>
              <input
                type="text"
                value="COP — Peso colombiano"
                disabled
                className="mt-1.5 w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-sm text-muted"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Zona horaria</span>
              <select
                value={config.zonaHoraria}
                onChange={(e) => actualizarCampo("zonaHoraria", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="America/Bogota">Bogotá (UTC-5)</option>
                <option value="America/New_York">Nueva York (UTC-5/-4)</option>
                <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
              </select>
            </label>
          </div>
        </Tarjeta>

        <Tarjeta>
          <h2 className="text-base font-semibold text-slate-900">Preferencias visuales</h2>

          <div className="mt-5 space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Notificaciones</p>
                <p className="text-xs text-muted">Alertas de stock bajo y recordatorios.</p>
              </div>
              <input
                type="checkbox"
                checked={config.notificaciones}
                onChange={(e) => actualizarCampo("notificaciones", e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Tema oscuro</p>
                <p className="text-xs text-muted">Preparado para activarse en una próxima versión.</p>
              </div>
              <input
                type="checkbox"
                checked={config.temaOscuro}
                onChange={(e) => actualizarCampo("temaOscuro", e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
            </label>
          </div>
        </Tarjeta>
      </div>

      <div className="flex justify-end">
        <Boton variante="secundario" onClick={restaurarDefault}>
          Restaurar valores predeterminados
        </Boton>
      </div>
    </div>
  );
}
