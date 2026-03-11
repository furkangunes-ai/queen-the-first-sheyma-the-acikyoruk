"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Crown,
  Users,
  Loader2,
  RefreshCw,
  Check,
  Shield,
} from "lucide-react";

interface UserWithSub {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  createdAt: string;
  subscription: {
    id: string;
    tier: string;
    startDate: string;
    endDate: string | null;
  } | null;
}

export default function SubscriptionManager() {
  const [users, setUsers] = useState<UserWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users-with-subscriptions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Kullanıcı listesi yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleTierChange = async (userId: string, newTier: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier: newTier }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Güncelleme başarısız");
      }
      toast.success(
        `${users.find((u) => u.id === userId)?.displayName} → ${newTier === "premium" ? "Premium" : "Temel"}`
      );
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setUpdatingId(null);
    }
  };

  const basicCount = users.filter(
    (u) => !u.subscription || u.subscription.tier === "basic"
  ).length;
  const premiumCount = users.filter(
    (u) => u.subscription?.tier === "premium"
  ).length;

  return (
    <div className="glass-panel p-6 sm:p-8 relative z-10 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 shadow-inner">
            <Crown className="text-amber-400 drop-shadow-sm" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-tight">
              Abonelik Yönetimi
            </h2>
            <p className="text-xs text-white/40 font-medium mt-0.5">
              {users.length} kullanıcı &middot; {premiumCount} premium &middot;{" "}
              {basicCount} temel
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchUsers}
          disabled={loading}
          className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white shadow-lg disabled:opacity-50"
          title="Yenile"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-white/50 mb-1">
            <Users size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Temel
            </span>
          </div>
          <span className="text-2xl font-black text-white">{basicCount}</span>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Crown size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Premium
            </span>
          </div>
          <span className="text-2xl font-black text-white">{premiumCount}</span>
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 opacity-50">
          <Users size={40} className="text-white/40 mx-auto mb-3" />
          <p className="text-sm font-bold text-white/60">Kullanıcı bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const currentTier = user.subscription?.tier || "basic";
            const isPremium = currentTier === "premium";
            const isUpdating = updatingId === user.id;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isPremium
                    ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white/90 truncate">
                      {user.displayName}
                    </span>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
                        <Crown size={10} className="text-amber-400" />
                        <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                          Premium
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/40">
                    <span>@{user.username}</span>
                    {user.email && <span>{user.email}</span>}
                    <span>
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin text-amber-400" />
                  ) : isPremium ? (
                    <button
                      onClick={() => handleTierChange(user.id, "basic")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10"
                    >
                      <Shield size={14} />
                      Temel'e Düşür
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTierChange(user.id, "premium")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 transition-all border border-amber-500/20"
                    >
                      <Crown size={14} />
                      Premium Yap
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
