"use client";

import { useState, useEffect } from "react";

interface TierState {
  tier: string;
  isBasic: boolean;
  isPremium: boolean;
  isLoading: boolean;
}

export function useTierCheck(): TierState {
  const [state, setState] = useState<TierState>({
    tier: "basic",
    isBasic: true,
    isPremium: false,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchTier() {
      try {
        const res = await fetch("/api/subscription");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          const tier = data.tier || "basic";
          setState({
            tier,
            isBasic: tier === "basic",
            isPremium: tier === "premium",
            isLoading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }

    fetchTier();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
