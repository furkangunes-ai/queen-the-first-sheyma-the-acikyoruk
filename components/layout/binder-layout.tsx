"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { TEXTURES } from '@/components/skeuomorphic';
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
  Bell,
} from 'lucide-react';
import { motion } from 'motion/react';
import NotificationBell from '@/components/notifications/notification-bell';

const NAV_ITEMS = [
  { path: '/', label: 'Genel Bakış', icon: LayoutDashboard },
  { path: '/tasks', label: 'Planlama', icon: CheckSquare },
  { path: '/exams', label: 'Denemeler', icon: GraduationCap },
  { path: '/analytics', label: 'Analiz', icon: BarChart2 },
  { path: '/check-in', label: 'Check-in', icon: Heart },
  { path: '/metrics', label: 'Metrikler', icon: Activity },
  { path: '/gallery', label: 'Dosyalar', icon: ImageIcon },
];

const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Admin Paneli', icon: Shield },
];

export function BinderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Kullanıcı';
  const isAdmin = (session?.user as any)?.role === 'admin';

  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden"
      style={{
        backgroundImage: `url(${TEXTURES.wood})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Binder Container */}
      <div className="relative w-full max-w-6xl h-[85vh] flex rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border-8 border-slate-800 ring-1 ring-white/10">

        {/* Binder Spine (Left Side Navigation) */}
        <div
          className="w-24 sm:w-64 h-full flex flex-col relative z-20 shadow-2xl"
          style={{
            backgroundImage: `url(${TEXTURES.leather})`,
            backgroundSize: 'cover',
          }}
        >
          {/* Stitching effect */}
          <div className="absolute top-0 bottom-0 left-2 w-1 border-l-2 border-dashed border-yellow-700/50"></div>
          <div className="absolute top-0 bottom-0 right-2 w-1 border-r-2 border-dashed border-yellow-700/50"></div>

          {/* User Profile */}
          <div className="p-6 pt-10 flex flex-col items-center gap-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-yellow-600 shadow-inner flex items-center justify-center overflow-hidden">
              <UserCircle className="w-12 h-12 text-slate-500" />
            </div>
            <div className="text-center">
              <h2 className="text-yellow-50 font-serif text-lg tracking-wide hidden sm:block">{userName}</h2>
              {isAdmin && (
                <span className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold">Admin</span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-1 text-yellow-500 text-xs hover:text-yellow-300 transition-colors uppercase tracking-widest font-bold mt-2 mx-auto"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-8 flex flex-col gap-2 px-3 overflow-y-auto">
            {allNavItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group
                    ${isActive
                      ? 'bg-yellow-50 text-yellow-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] translate-x-2'
                      : 'text-yellow-100/70 hover:bg-white/10 hover:text-yellow-50 hover:translate-x-1'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden sm:block font-medium tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Branding */}
          <div className="p-6 text-center text-yellow-900/40 font-serif text-xs italic">
            Life Tracker v1.0
          </div>
        </div>

        {/* Binder Rings */}
        <div className="absolute left-[5.5rem] sm:left-[15.5rem] top-0 bottom-0 w-8 z-30 flex flex-col justify-evenly py-10 pointer-events-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-8 h-12 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 rounded-lg shadow-xl ring-1 ring-black/20 flex items-center justify-center">
              <div className="w-6 h-1 bg-slate-800/10 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
          {/* Inner Shadow for depth */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none"></div>

          {/* Top Bar with Notification Bell */}
          <div className="flex items-center justify-end px-4 sm:px-8 md:px-12 pt-3 pb-0 relative z-20">
            <NotificationBell />
          </div>

          {/* Content Render */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pt-2 relative z-0">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
