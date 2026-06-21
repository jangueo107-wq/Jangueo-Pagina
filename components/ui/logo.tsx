"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/formato";
import { rutaLogo } from "@/lib/tema";

interface LogoProps {
  /** Tamaño en píxeles (ancho y alto del contenedor) */
  size?: number;
  className?: string;
  /** Mostrar fallback de texto si la imagen no carga */
  showFallback?: boolean;
}

export function Logo({ size = 40, className, showFallback = true }: LogoProps) {
  const [error, setError] = useState(false);

  if (error && showFallback) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-accent/20 font-bold text-accent",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
        aria-label="Jangueo"
      >
        J
      </div>
    );
  }

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-lg", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={rutaLogo}
        alt="Logo Jangueo"
        fill
        className="object-cover"
        sizes={`${size}px`}
        onError={() => setError(true)}
        priority
      />
    </div>
  );
}
