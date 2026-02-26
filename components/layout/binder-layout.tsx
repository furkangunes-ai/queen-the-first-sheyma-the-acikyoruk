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
  BrainCircuit,
  Zap,
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
  { path: '/strategy', label: 'Strateji', icon: BrainCircuit },
  { path: '/speed-reading', label: 'Hızlı Okuma', icon: Zap },
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
          <Sparkles className="w-6 h-6 text-pink-400" />
          <h1 className="text-2xl font-bold tracking-tight text-gradient-candy">
            Şeyda
          </h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-4 overflow-y-auto no-scrollbar">
        {allNavItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavClick}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
                ${isActive
                  ? 'bg-pink-500/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(255,42,133,0.3)] border border-pink-400/30'
                  : 'text-white/60 hover:bg-pink-500/10 hover:text-white border border-transparent hover:border-pink-500/20'
                }
              `}
            >
              <item.icon className={`w-[20px] h-[20px] flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-pink-300' : 'group-hover:scale-110 group-hover:text-pink-300'}`} />
              <span className="text-[15px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="p-4 mt-auto">
        <div className="glass p-3 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30 border border-white/20">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90 truncate">{userName}</p>
              {isAdmin && (
                <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold">Admin</span>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors border border-white/5"
          >
            <LogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
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
    <div className="min-h-screen w-full flex bg-background">
      {/* Glow Effect Orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-600/10 blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] h-screen sticky top-0 flex-col relative z-20">
        <div className="absolute inset-4 glass-panel flex flex-col h-[calc(100vh-2rem)] overflow-hidden">
           <SidebarContent
             pathname={pathname}
             allNavItems={allNavItems}
             userName={userName}
             isAdmin={isAdmin}
           />
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#110915]/80 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 p-4 lg:hidden"
            >
              <div className="glass-panel w-full h-full flex flex-col relative overflow-hidden">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 active:bg-white/20 z-10 transition-colors"
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
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="flex items-center justify-between p-4 lg:p-8 pb-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl glass text-white/80 active:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block text-white/50 text-sm font-medium tracking-wide">
              Yaşam Takibi App
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass rounded-full p-1 border-white/10 shadow-lg shadow-pink-500/10">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:px-8 lg:pb-8 lg:pt-6 no-scrollbar">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
