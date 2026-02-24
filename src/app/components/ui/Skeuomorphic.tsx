import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Assets
export const TEXTURES = {
  wood: "https://images.unsplash.com/photo-1764175853542-7958f9ef00ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwd29vZCUyMHRleHR1cmUlMjBkZXNrdG9wJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzE5MjUxNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  leather: "https://images.unsplash.com/photo-1718115690443-cd8b7f6c112b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwdGV4dHVyZSUyMGRhcmslMjBicm93biUyMHNlYW1sZXNzfGVufDF8fHx8MTc3MTkyNTE0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  paper: "https://images.unsplash.com/photo-1601662528567-526cd06f6582?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHdoaXRlJTIwcGFwZXIlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MTkyNTE0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  graph: "https://images.unsplash.com/photo-1700553498563-5e6513864ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaCUyMHBhcGVyJTIwdGV4dHVyZSUyMGxpZ2h0JTIwZ3JpZHxlbnwxfHx8fDE3NzE5MjUxNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

export const Paper = ({ children, className, style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <div 
    className={cn("relative bg-white shadow-md p-6 sm:p-8 md:p-10", className)}
    style={{
      backgroundImage: `url(${TEXTURES.paper})`,
      backgroundSize: 'cover',
      boxShadow: '2px 2px 10px rgba(0,0,0,0.1), 10px 10px 30px rgba(0,0,0,0.05)',
      ...style
    }}
  >
    {children}
  </div>
);

export const Handwriting = ({ children, className, as: Component = 'p' }: { children: React.ReactNode, className?: string, as?: any }) => (
  <Component className={cn("font-serif italic text-slate-800", className)} style={{ fontFamily: '"Kalam", "Caveat", "Indie Flower", cursive' }}>
    {children}
  </Component>
);

export const Tape = ({ className }: { className?: string }) => (
  <div className={cn("absolute w-24 h-8 bg-white/40 backdrop-blur-sm shadow-sm rotate-[-2deg] z-20 border-l border-r border-white/60", className)} />
);
