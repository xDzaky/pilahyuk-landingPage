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
        <div className="flex flex-col h-full bg-[#0D2920] text-white">
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
                    "flex items-center gap-3 px-3 py-2 rounded-none text-xs font-medium transition-all my-0.5 border-l-[3px]",
                    active
                      ? "bg-[#DDF3EC] text-[#0D2920] font-semibold border-l-[#3D9274]"
                      : "text-white/60 hover:bg-white/10 hover:text-white border-l-transparent"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#0D2920]" : "text-white/60")} />
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
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-xs text-[#DDF3EC]/70 hover:text-white hover:bg-white/10 transition-colors"
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-colors border-l-[3px]",
                      active ? "bg-[#DDF3EC] text-[#0D2920] font-semibold border-l-[#3D9274]" : "text-white/60 hover:bg-white/10 hover:text-white border-l-transparent"
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
        <header className="sticky top-0 z-20 shrink-0 bg-white border-b border-[#D2DCD5] h-16 flex items-center px-4 sm:px-6 gap-4">
          <button
            className="lg:hidden text-[#1E2925] hover:bg-[#EDF1EC] p-2 rounded-[6px] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka navigasi admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[#1E2925] font-semibold text-sm">Console Super Admin</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-[#F6F8F5] border border-[#D2DCD5] rounded-full text-[10px] text-[#55615B] font-mono">
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
                  notifOpen ? "bg-[#DDF3EC] text-[#173F35]" : "text-[#55615B] hover:text-[#1E2925] hover:bg-[#EDF1EC]"
                )}
                aria-label={`Alert sistem (${unreadCount} belum dibaca)`}
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Admin Notification Panel */}
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#D2DCD5] rounded-[6px] overflow-hidden z-50 text-[#1E2925]"
                  style={{ boxShadow: "0 10px 32px rgba(23,63,53,0.12)" }}
                >
                  <div className="px-4 py-3 border-b border-[#D2DCD5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1E2925]">System Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#246B56] hover:text-[#173F35] font-semibold transition-colors"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-[#D2DCD5] bg-[#F6F8F5] px-3 pt-1">
                    <button
                      onClick={() => setNotifFilter("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
                        notifFilter === "all" ? "border-[#173F35] text-[#173F35] font-bold" : "border-transparent text-[#55615B] hover:text-[#1E2925]"
                      )}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter("unread")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
                        notifFilter === "unread" ? "border-[#173F35] text-[#173F35] font-bold" : "border-transparent text-[#55615B] hover:text-[#1E2925]"
                      )}
                    >
                      Belum Dibaca ({unreadCount})
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#D2DCD5]">
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
                              n.read ? "bg-white hover:bg-[#EDF1EC]" : "bg-[#F4FAF7] hover:bg-[#EDF7F2]"
                            )}
                          >
                            <div className="mt-0.5 shrink-0">{icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-[#1E2925] group-hover:text-[#246B56] transition-colors truncate">
                                {n.title}
                              </div>
                              <div className="text-[11px] text-[#55615B] mt-0.5 leading-snug line-clamp-2">
                                {n.desc}
                              </div>
                              <div className="text-[10px] text-[#55615B]/70 mt-1">{n.time}</div>
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-[#55615B]">
                        Tidak ada log alert
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-[#D2DCD5] bg-[#F6F8F5] text-center">
                    <Link
                      href="/admin/audit"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-semibold text-[#246B56] hover:text-[#173F35] transition-colors"
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
                  profileOpen ? "bg-[#DDF3EC]" : "hover:bg-[#EDF1EC]"
                )}
                aria-label="Menu akun Super Admin"
                aria-expanded={profileOpen}
              >
                <div className="w-8 h-8 bg-[#173F35] border border-[#246B56] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">SA</span>
                </div>
                <span className="hidden sm:block text-xs font-semibold text-[#1E2925]">Super Admin</span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-[#55615B] transition-transform duration-200 group-hover:text-[#1E2925]",
                  profileOpen && "rotate-180 text-[#173F35]"
                )} />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#D2DCD5] rounded-[6px] overflow-hidden z-50 text-[#1E2925]"
                  style={{ boxShadow: "0 10px 32px rgba(23,63,53,0.12)" }}
                >
                  <div className="p-3.5 border-b border-[#D2DCD5] bg-[#F6F8F5]">
                    <div className="text-xs font-bold text-[#1E2925]">Ahmad Fauzan</div>
                    <div className="text-[11px] text-[#55615B]">admin@pilahyuk.id</div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#B54747] text-[10px] font-mono">
                      Role: super_admin
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#1E2925] hover:bg-[#EDF1EC] rounded-[4px] transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manajemen Pengguna</span>
                    </Link>
                    <Link
                      href="/admin/konfigurasi"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#1E2925] hover:bg-[#EDF1EC] rounded-[4px] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Konfigurasi Sistem</span>
                    </Link>
                    <Link
                      href="/admin/audit"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#1E2925] hover:bg-[#EDF1EC] rounded-[4px] transition-colors"
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                      <span>Log Audit</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#D2DCD5] p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#B54747] hover:bg-[#FCEBEB] rounded-[4px] transition-colors text-left"
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
