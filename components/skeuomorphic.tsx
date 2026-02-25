import React from 'react';
import { cn } from '@/lib/utils';

// Textures removed — keeping empty object for backward compatibility
export const TEXTURES = {
  wood: "",
  leather: "",
  paper: "",
  graph: ""
};

// GlassCard — replaces Paper
export const GlassCard = ({ children, className, style = {}, onClick }: { children: React.ReactNode, className?: string, style?: React.CSSProperties, onClick?: () => void }) => (
  <div
    className={cn(
      "relative rounded-2xl p-6 sm:p-8 md:p-10",
      "bg-white/[0.04] backdrop-blur-xl",
      "border border-pink-500/[0.12]",
      "shadow-lg shadow-pink-500/[0.03]",
      className
    )}
    style={style}
    onClick={onClick}
  >
    {children}
  </div>
);

// Heading — replaces Handwriting
export const Heading = ({ children, className, as: Component = 'p' }: { children: React.ReactNode, className?: string, as?: any }) => (
  <Component className={cn("font-display text-white tracking-wide", className)}>
    {children}
  </Component>
);

// Accent — replaces Tape (decorative gold line)
export const Accent = ({ className }: { className?: string }) => (
  <div className={cn("h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent", className)} />
);

// Backward-compatible aliases
export const Paper = GlassCard;
export const Handwriting = Heading;
export const Tape = Accent;
