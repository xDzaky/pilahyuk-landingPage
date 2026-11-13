// src/app/(admin)/layout.tsx
// Super Admin layout — integrated flex sidebar + interactive header
"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, Building2, ShieldCheck, Scale,
  FileText, AlertOctagon, ScrollText, Settings, Mail,
  BarChart2, ChevronDown, Bell, Menu, X, LogOut,
  User, Shield, AlertTriangle, CheckCheck, Clock,
  Activity, ExternalLink, Search, ArrowRight, CheckCircle2
} from "lucide-react"

const ADMIN_NAV = [
  { href: "/admin/overview",    icon: LayoutDashboard, label: "Overview",       badge: null },
  { href: "/admin/users",       icon: Users,           label: "Users",          badge: null },
  { href: "/admin/organisasi",  icon: Building2,       label: "Organizations",  badge: null },
  { href: "/admin/verifikasi",  icon: ShieldCheck,     label: "Verification",   badge: { count: 3, color: "bg-red-500/80" } },
  { href: "/admin/material",    icon: Scale,           label: "Material",       badge: null },
  { href: "/admin/moderasi",    icon: FileText,        label: "Moderation",     badge: null },
  { href: "/admin/sengketa",    icon: AlertOctagon,    label: "Disputes",       badge: { count: 2, color: "bg-orange-500/80" } },
  { href: "/admin/audit",       icon: ScrollText,      label: "Audit Log",      badge: null },
  { href: "/admin/konfigurasi", icon: Settings,        label: "Config",         badge: null },
  { href: "/admin/template",    icon: Mail,            label: "Templates",      badge: null },
  { href: "/admin/laporan",     icon: BarChart2,       label: "Reports",        badge: null },
]

const INITIAL_ADMIN_NOTIFICATIONS = [
  {
    id: "an1",
    type: "warning" as const,
    title: "3 organisasi menunggu verifikasi",
    desc: "Menunggu peninjauan berkas izin & lokasi lebih dari 48 jam",
    time: "Baru saja",
    link: "/admin/verifikasi",
    read: false,
  },
  {
    id: "an2",
    type: "alert" as const,
    title: "Sengketa baru dibuka #DISP-088",
    desc: "Komunitas Hijau vs Bank Sampah Berkah Jaya mengenai selisih berat 2,5 kg",
    time: "14 menit lalu",
    link: "/admin/sengketa",
    read: false,
  },
  {
    id: "an3",
    type: "info" as const,
    title: "Batch PY-20261113-MELATI-001 siap verifikasi",
    desc: "42,6 kg Plastik PET dari Bank Sampah Melati telah dikirim ke pengolah",
    time: "1 jam lalu",
    link: "/admin/overview",
    read: false,
  },
  {
    id: "an4",
    type: "success" as const,
    title: "Health check: Semua service OK",
    desc: "Database Neon PostgreSQL, R2 Storage, dan API Gateway berjalan 99.98% uptime",
    time: "2 jam lalu",
    link: "/admin/overview",
    read: false,
  },
  {
    id: "an5",
    type: "warning" as const,
    title: "5 laporan dampak bulanan masuk",
    desc: "Laporan verifikasi dampak lingkungan siap dievaluasi",
    time: "Kemarin",
    link: "/admin/laporan",
    read: true,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all")
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_ADMIN_NOTIFICATIONS)

  const pathname = usePathname()
  const router = useRouter()

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on route change
  useEffect(() => {
    setNotifOpen(false)
    setProfileOpen(false)
    setMobileOpen(false)
  }, [pathname])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filteredNotifs = useMemo(() => {
    if (notifFilter === "unread") return notifications.filter(n => !n.read)
    return notifications
  }, [notifications, notifFilter])

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const handleNotificationClick = useCallback((id: string, link?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setNotifOpen(false)
    if (link) router.push(link)
  }, [router])

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" })
    } catch {}
    localStorage.removeItem("pilahyuk_token")
    localStorage.removeItem("pilahyuk_user")
    router.push("/login")
  }, [router])

  return (
    <div className="flex h-screen w-full bg-[#F6F8F5] overflow-hidden text-[#1E2925]">
      {/* Skip link */}
      <a href="#admin-main" className="skip-link">Lewati navigasi</a>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex flex-col h-full w-56 shrink-0 border-r border-white/10 z-30 select-none"
        aria-label="Navigasi admin"
      >
        <div className="flex flex-col h-full bg-[#0D2920] brand-motif text-white">
          {/* Logo Header */}
          <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
            <Link href="/admin/overview" className="flex items-center gap-3 min-w-0 group">
              <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <ShieldCheck className="w-4 h-4 text-red-300" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm truncate">Super Admin</div>
                <div className="text-white/40 text-[10px] truncate">PilahYuk 2.0</div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {ADMIN_NAV.map(item => {
              const active = pathname === item.href || (item.href !== "/admin/overview" && (pathname ?? "").startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-[12px] text-xs font-medium transition-all my-0.5",
                    active
                      ? "bg-white/15 text-white font-semibold shadow-sm border-l-[2px] border-white/60"
                      : "text-white/60 hover:bg-white/10 hover:text-white border-l-[2px] border-transparent"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-white/60")} />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto px-1.5 py-0.5 ${item.badge.color} text-white text-[9px] font-bold rounded-full leading-none`}>
                      {item.badge.count}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-white/10 p-3 shrink-0">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[10px] text-xs text-[#DDF3EC]/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Portal Mitra</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-60 max-w-[80vw] h-full z-50 bg-[#0D2920] text-white">
            <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
              <Link href="/admin/overview" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-red-300" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Super Admin</div>
                  <div className="text-white/40 text-[10px]">PilahYuk 2.0</div>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-white/70 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {ADMIN_NAV.map(item => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors",
                      active ? "bg-white/15 text-white font-semibold" : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-1.5 py-0.5 ${item.badge.color} text-white text-[9px] font-bold rounded-full leading-none`}>
                        {item.badge.count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 shrink-0 bg-[#0D2920] border-b border-white/10 h-14 flex items-center px-4 sm:px-6 gap-4">
          <button
            className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka navigasi admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">Console Super Admin</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/70 font-mono">
              v2.0-stable
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Interactive System Alerts Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(prev => !prev); setProfileOpen(false) }}
                className={cn(
                  "relative p-2 rounded-lg transition-colors focus:outline-none",
                  notifOpen ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                aria-label={`Alert sistem (${unreadCount} belum dibaca)`}
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#0D2920]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Admin Notification Panel */}
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#122B22] border border-white/15 rounded-[16px] shadow-2xl overflow-hidden z-50 text-white"
                  style={{ boxShadow: "0 10px 32px rgba(0,0,0,0.4)" }}
                >
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">System Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#DDF3EC]/70 hover:text-white font-medium transition-colors"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-white/10 bg-black/20 px-3 pt-1">
                    <button
                      onClick={() => setNotifFilter("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
                        notifFilter === "all" ? "border-white text-white font-bold" : "border-transparent text-white/50 hover:text-white"
                      )}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter("unread")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
                        notifFilter === "unread" ? "border-white text-white font-bold" : "border-transparent text-white/50 hover:text-white"
                      )}
                    >
                      Belum Dibaca ({unreadCount})
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map(n => {
                        const icon =
                          n.type === "alert" ? <AlertOctagon className="w-4 h-4 text-red-400" /> :
                          n.type === "warning" ? <AlertTriangle className="w-4 h-4 text-[#E7A34B]" /> :
                          n.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[#3D9274]" /> :
                          <Activity className="w-4 h-4 text-[#286A9B]" />

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id, n.link)}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer group",
                              n.read ? "hover:bg-white/5 opacity-60" : "bg-white/5 hover:bg-white/10"
                            )}
                          >
                            <div className="mt-0.5 shrink-0">{icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-white group-hover:text-[#DDF3EC] transition-colors truncate">
                                {n.title}
                              </div>
                              <div className="text-[11px] text-white/50 mt-0.5 leading-snug line-clamp-2">
                                {n.desc}
                              </div>
                              <div className="text-[10px] text-white/30 mt-1">{n.time}</div>
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-6 text-center text-xs text-white/40">
                        Tidak ada log alert
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-white/10 bg-black/20 text-center">
                    <Link
                      href="/admin/audit"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-medium text-[#DDF3EC]/70 hover:text-white transition-colors"
                    >
                      Buka Audit Trail Lengkap →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Admin Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(prev => !prev); setNotifOpen(false) }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors focus:outline-none group",
                  profileOpen ? "bg-white/15" : "hover:bg-white/10"
                )}
                aria-label="Menu akun Super Admin"
                aria-expanded={profileOpen}
              >
                <div className="w-7 h-7 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-red-300 text-xs font-bold">SA</span>
                </div>
                <span className="hidden sm:block text-xs font-medium text-white/90">Super Admin</span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-white/50 transition-transform duration-200 group-hover:text-white",
                  profileOpen && "rotate-180 text-white"
                )} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-[#122B22] border border-white/15 rounded-[16px] shadow-2xl overflow-hidden z-50 text-white"
                  style={{ boxShadow: "0 10px 32px rgba(0,0,0,0.4)" }}
                >
                  <div className="p-3.5 border-b border-white/10 bg-black/20">
                    <div className="text-xs font-bold text-white">Ahmad Fauzan</div>
                    <div className="text-[11px] text-white/50">admin@pilahyuk.id</div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono">
                      Role: super_admin
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-[8px] transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manajemen Pengguna</span>
                    </Link>
                    <Link
                      href="/admin/konfigurasi"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-[8px] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Konfigurasi Sistem</span>
                    </Link>
                    <Link
                      href="/admin/audit"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-[8px] transition-colors"
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                      <span>Log Audit</span>
                    </Link>
                  </div>

                  <div className="border-t border-white/10 p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[8px] transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          id="admin-main"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          tabIndex={-1}
        >
          <div className="max-w-[1360px] mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
