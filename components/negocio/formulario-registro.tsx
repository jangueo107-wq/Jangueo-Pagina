"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Boton, Tarjeta } from "@/components/ui/primitives";
import { MensajeFeedback } from "@/components/ui/campo-numero";

interface FormularioRegistroProps {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  onSubmit: () => string | null | void;
  textoBoton?: string;
  onExito?: () => void;
}

export function FormularioRegistro({
  titulo,
  descripcion,
  children,
  onSubmit,
  textoBoton = "Guardar",
  onExito,
}: FormularioRegistroProps) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"ok" | "error">("ok");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const resultado = onSubmit();
    if (typeof resultado === "string") {
      setTipo("error");
      setMensaje(resultado);
      return;
    }
    setTipo("ok");
    setMensaje("Registro guardado.");
    onExito?.();
  }

  return (
    <Tarjeta>
      <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
      {descripcion ? <p className="mt-1 text-sm text-muted">{descripcion}</p> : null}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {children}
        <div className="flex items-center gap-3">
          <Boton type="submit">{textoBoton}</Boton>
          <MensajeFeedback mensaje={mensaje} tipo={tipo} />
        </div>
      </form>
    </Tarjeta>
  );
}

interface CampoTextoProps {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: "text" | "date";
}

export function CampoTexto({
  etiqueta,
  valor,
  onChange,
  required,
  type = "text",
}: CampoTextoProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{etiqueta}</span>
      <input
        type={type}
        value={valor}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}

interface CampoSelectProps {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: { valor: string; etiqueta: string }[];
}

export function CampoSelect({ etiqueta, valor, onChange, opciones }: CampoSelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CampoMonedaProps {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
}

export function CampoMoneda({ etiqueta, valor, onChange }: CampoMonedaProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{etiqueta}</span>
      <input
        type="text"
        inputMode="numeric"
        value={valor}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
