"use client";

import React from "react";
import { useTierCheck } from "@/lib/hooks/use-tier-check";
import UpgradePrompt from "@/components/ui/upgrade-prompt";
import { Loader2 } from "lucide-react";

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Premium-only içeriği korur.
 * Basic kullanıcıya UpgradePrompt gösterir, premium kullanıcıya children'ı render eder.
 */
export default function PremiumGate({ feature, children, fallback }: PremiumGateProps) {
  const { isPremium, isLoading } = useTierCheck();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-white/30" size={24} />
      </div>
    );
  }

  if (!isPremium) {
    return fallback ? <>{fallback}</> : <UpgradePrompt feature={feature} />;
  }

  return <>{children}</>;
}
