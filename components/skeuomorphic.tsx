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
      "relative rounded-[calc(var(--radius)*1.5)] p-6 sm:p-8 md:p-10",
      "glass bg-white/[0.02]",
      "border border-white/5",
      "shadow-[0_8px_32px_-12px_rgba(255,42,133,0.15)]",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-pink-500/[0.05] before:to-transparent before:rounded-inherit before:pointer-events-none",
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
  <Component className={cn("font-semibold tracking-tight text-white", className)}>
    {children}
  </Component>
);

// Accent — replaces Tape (decorative glowing line)
export const Accent = ({ className }: { className?: string }) => (
  <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-[1px]", className)} />
);

// Backward-compatible aliases
export const Paper = GlassCard;
export const Handwriting = Heading;
export const Tape = Accent;
