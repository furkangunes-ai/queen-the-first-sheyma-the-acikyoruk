"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  BarChart2,
  Image as ImageIcon,
  UserCircle,
  Heart,
  Activity,
  Shield,
  LogOut,
  BookOpenCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NotificationBell from '@/components/notifications/notification-bell';

const NAV_ITEMS = [
  { path: '/', label: 'Genel Bakış', icon: LayoutDashboard },
  { path: '/tasks', label: 'Planlama', icon: CheckSquare },
  { path: '/exams', label: 'Denemeler', icon: GraduationCap },
  { path: '/study', label: 'Günlük Çalışma', icon: BookOpenCheck },
  { path: '/analytics', label: 'Analiz', icon: BarChart2 },
  { path: '/check-in', label: 'Check-in', icon: Heart },
  { path: '/metrics', label: 'Metrikler', icon: Activity },
  { path: '/gallery', label: 'Dosyalar', icon: ImageIcon },
];

const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Admin Paneli', icon: Shield },
];

function SidebarContent({ pathname, allNavItems, userName, isAdmin, onNavClick }: {
  pathname: string;
  allNavItems: typeof NAV_ITEMS;
  userName: string;
  isAdmin: boolean;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo / Brand */}
      <div className="p-6 pt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h1 className="font-display text-xl text-gradient-gold tracking-wide">
            Şeyda
          </h1>
        </div>
        <div className="mt-2 h-px bg-gradient-to-r from-pink-500/30 via-pink-500/10 to-transparent" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        {allNavItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavClick}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-pink-500/15 text-pink-300 border-l-2 border-pink-400 pl-[10px]'
                  : 'text-white/40 active:bg-white/5 active:text-white/70'
                }
              `}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="p-4 border-t border-pink-500/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-pink-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 font-medium truncate">{userName}</p>
            {isAdmin && (
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">Admin</span>
            )}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-4 py-2 mt-1 rounded-lg text-white/30 text-xs font-medium tracking-wide active:bg-white/5 active:text-white/50 transition-colors"
        >
          <LogOut size={14} />
          <span>Çıkış Yap</span>
        </button>
      </div>

      {/* Subtle glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-500/[0.03] to-transparent pointer-events-none" />
    </>
  );
}

export function BinderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = session?.user?.name || 'Kullanıcı';
  const isAdmin = (session?.user as any)?.role === 'admin';

  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <div className="min-h-screen w-full bg-[#0a0a1a] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col relative bg-[#0a0a1a]/80 backdrop-blur-xl border-r border-pink-500/10">
        <SidebarContent
          pathname={pathname}
          allNavItems={allNavItems}
          userName={userName}
          isAdmin={isAdmin}
        />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#0a0a1a] border-r border-pink-500/10 z-50 flex flex-col lg:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 active:bg-white/10 z-10"
              >
                <X size={18} />
              </button>
              <SidebarContent
                pathname={pathname}
                allNavItems={allNavItems}
                userName={userName}
                isAdmin={isAdmin}
                onNavClick={() => setMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-pink-500/[0.06]">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/50 active:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Decorative pink line */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
