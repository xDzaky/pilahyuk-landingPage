// src/app/(portal)/layout.tsx
"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SyncIndicator } from "@/components/dashboard/SyncIndicator"
import {
  LayoutDashboard, Users, BookOpen, Package, Truck,
  Landmark, QrCode, BarChart2, HelpCircle, Settings,
  ChevronLeft, ChevronRight, Bell, Search, Menu, X,
  Building2, ChevronDown, LogOut, User, CheckCheck,
  Clock, AlertTriangle, RefreshCw, CheckCircle2,
  ExternalLink, ArrowRight, Check
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "UTAMA",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard Operasional" },
      { href: "/komunitas", icon: Building2, label: "Dashboard Komunitas" },
    ],
  },
  {
    label: "KOMUNITAS",
    items: [
      { href: "/komunitas/anggota", icon: Users, label: "Komunitas" },
      { href: "/pengetahuan", icon: BookOpen, label: "Pengetahuan Budaya" },
    ],
  },
  {
    label: "OPERASIONAL",
    items: [
      { href: "/material", icon: Package, label: "Material" },
      { href: "/pengumpulan", icon: Truck, label: "Pengumpulan" },
      { href: "/bank-sampah", icon: Landmark, label: "Bank Sampah" },
      { href: "/batch", icon: QrCode, label: "Jejak Batch" },
    ],
  },
  {
    label: "LAPORAN",
    items: [
      { href: "/dampak", icon: BarChart2, label: "Dampak" },
    ],
  },
  {
    label: "LAINNYA",
    items: [
      { href: "/bantuan", icon: HelpCircle, label: "Bantuan & Sengketa" },
      { href: "/pengaturan", icon: Settings, label: "Pengaturan" },
    ],
  },
]

// Mock organizations for switcher
const AVAILABLE_ORGS = [
  { id: "org-002", name: "Bank Sampah Melati", type: "Bank Sampah", role: "operator_bank_sampah", roleLabel: "Operator Bank Sampah", short: "BS" },
  { id: "org-001", name: "Komunitas Hijau RW 05", type: "Komunitas", role: "pengurus_komunitas", roleLabel: "Pengurus Komunitas", short: "KH" },
  { id: "org-003", name: "Pengolah Mandiri Jaya", type: "Pengolah / Recycler", role: "operator_bank_sampah", roleLabel: "Koordinator Pengolah", short: "PM" },
]

// Mock notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "warning" as const,
    title: "2 transaksi menunggu sinkronisasi",
    desc: "Periksa koneksi dan sinkronkan data penimbangan offline sebelum sesi berakhir",
    time: "10 mnt lalu",
    link: "/bank-sampah",
    read: false,
  },
  {
    id: "n2",
    type: "success" as const,
    title: "Batch PY-20261113-MELATI-001 terverifikasi",
    desc: "42,6 kg Plastik PET telah diterima & divalidasi oleh Pengolah Mandiri Jaya",
    time: "1 jam lalu",
    link: "/batch",
    read: false,
  },
  {
    id: "n3",
    type: "info" as const,
    title: "Permintaan jemput baru #REQ-882",
    desc: "Dewi Lestari mengajukan penjemputan sampah pilah RW 05 Blok A",
    time: "3 jam lalu",
    link: "/pengumpulan",
    read: false,
  },
  {
    id: "n4",
    type: "info" as const,
    title: "Pembaruan harga acuan material",
    desc: "Harga pasar Plastik PET per kilogram mengalami penyesuaian menjadi Rp 3.500",
    time: "1 hari lalu",
    link: "/material",
    read: true,
  },
]

// Search items index
const SEARCH_DATABASE = [
  { type: "Anggota", label: "Dewi Lestari", meta: "Saldo Rp 13.210 · RW 05", link: "/komunitas/anggota" },
  { type: "Anggota", label: "Nurul Hidayah", meta: "Saldo Rp 10.500 · RW 05", link: "/komunitas/anggota" },
  { type: "Anggota", label: "Reza Pratama", meta: "Saldo Rp 24.000 · RW 05", link: "/komunitas/anggota" },
  { type: "Material", label: "Plastik PET (Kode 1)", meta: "Rp 3.500 / kg · Bersih & pipih", link: "/material" },
  { type: "Material", label: "Plastik HDPE (Kode 2)", meta: "Rp 2.000 / kg · Botol detergen", link: "/material" },
  { type: "Material", label: "Kertas HVS & Buku", meta: "Rp 1.800 / kg · Bebas staples", link: "/material" },
  { type: "Material", label: "Kardus & Karton", meta: "Rp 1.500 / kg · Lipat rata", link: "/material" },
  { type: "Batch", label: "PY-20261113-MELATI-001", meta: "42,6 kg · Plastik PET · Diserahkan", link: "/batch" },
  { type: "Halaman", label: "Penimbangan Bank Sampah", meta: "Catat timbang & ledger", link: "/bank-sampah" },
  { type: "Halaman", label: "Laporan Dampak Lingkungan", meta: "Metrik CO2 & reduksi sampah", link: "/dampak" },
]

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all")
  const [profileOpen, setProfileOpen] = useState(false)
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false)
  const [outboxOpen, setOutboxOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingSyncCount, setPendingSyncCount] = useState(2)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  const [activeOrg, setActiveOrg] = useState(AVAILABLE_ORGS[0])
  const [userName, setUserName] = useState("Siti Rahayu")

  const pathname = usePathname()
  const router = useRouter()

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const orgSwitcherRef = useRef<HTMLDivElement>(null)

  // Load user & org info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pilahyuk_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.name) setUserName(parsed.name)
        if (parsed.org_name) {
          const match = AVAILABLE_ORGS.find(o => o.name === parsed.org_name)
          if (match) setActiveOrg(match)
        }
      }
    } catch {}
  }, [])

  // Close modals on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
      if (orgSwitcherRef.current && !orgSwitcherRef.current.contains(e.target as Node)) {
        setOrgSwitcherOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setNotifOpen(false)
    setProfileOpen(false)
    setSearchFocused(false)
    setOrgSwitcherOpen(false)
    setMobileOpen(false)
  }, [pathname])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false)
        setProfileOpen(false)
        setSearchFocused(false)
        setOrgSwitcherOpen(false)
        setOutboxOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifs = useMemo(() => {
    if (notifFilter === "unread") return notifications.filter(n => !n.read)
    return notifications
  }, [notifications, notifFilter])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return SEARCH_DATABASE.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.meta.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [searchQuery])

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const handleNotificationClick = useCallback((id: string, link?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setNotifOpen(false)
    if (link) router.push(link)
  }, [router])

  const handleSwitchOrg = useCallback((org: typeof AVAILABLE_ORGS[0]) => {
    setActiveOrg(org)
    setOrgSwitcherOpen(false)
    try {
      const stored = localStorage.getItem("pilahyuk_user")
      if (stored) {
        const parsed = JSON.parse(stored)
        parsed.org_name = org.name
        parsed.role = org.role
        localStorage.setItem("pilahyuk_user", JSON.stringify(parsed))
      }
    } catch {}
  }, [])

  const handleTriggerSync = useCallback(async () => {
    setIsSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 1400))
    setPendingSyncCount(0)
    setIsSyncing(false)
    setNotifications(prev => [
      {
        id: "sync-done-" + Date.now(),
        type: "success",
        title: "Sinkronisasi Berhasil",
        desc: "2 transaksi outbox telah berhasil tersinkron ke server pusat",
        time: "Baru saja",
        link: "/bank-sampah",
        read: false,
      },
      ...prev.filter(n => n.id !== "n1"),
    ])
  }, [])

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
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Lewati navigasi
      </a>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full shrink-0 border-r border-white/10 transition-[width] duration-200 z-30 select-none",
          sidebarCollapsed ? "w-16" : "w-60"
        )}
        aria-label="Navigasi utama portal"
      >
        <div className="flex flex-col h-full bg-[#173F35] brand-motif text-white relative">
          {/* Logo Header */}
          <div className={cn(
            "flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0",
            sidebarCollapsed && "justify-center px-2"
          )}>
            <Link href="/dashboard" className="flex items-center gap-3 min-w-0 group">
              <div className="w-8 h-8 bg-[#DDF3EC] rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <span className="text-[#173F35] font-black text-sm">P</span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm leading-tight truncate">PilahYuk</div>
                  <div className="text-[#DDF3EC]/60 text-[10px] truncate">Portal Mitra</div>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                {!sidebarCollapsed && (
                  <div className="px-2.5 pt-3 pb-1 text-[10px] font-bold text-[#DDF3EC]/40 tracking-wider uppercase">
                    {group.label}
                  </div>
                )}
                {group.items.map(item => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-sm font-medium transition-all my-0.5",
                        active
                          ? "bg-[#DDF3EC] text-[#173F35] font-semibold shadow-sm"
                          : "text-[#DDF3EC]/80 hover:bg-white/10 hover:text-white",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      aria-current={active ? "page" : undefined}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#173F35]" : "text-[#DDF3EC]/80")} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Organization Switcher Footer */}
          <div ref={orgSwitcherRef} className="border-t border-white/10 p-3 shrink-0 relative">
            <button
              onClick={() => setOrgSwitcherOpen(prev => !prev)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-[12px] p-2 hover:bg-white/10 transition-colors text-left group",
                orgSwitcherOpen && "bg-white/10",
                sidebarCollapsed && "justify-center p-1.5"
              )}
              title="Ganti Organisasi"
              aria-expanded={orgSwitcherOpen}
            >
              <div className="w-8 h-8 bg-[#246B56] border border-[#3D9274]/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white font-bold text-xs">{activeOrg.short}</span>
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-white text-xs font-semibold truncate leading-snug">{activeOrg.name}</div>
                    <div className="text-[#DDF3EC]/60 text-[10px] truncate">{activeOrg.type}</div>
                  </div>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-[#DDF3EC]/60 shrink-0 transition-transform duration-200",
                    orgSwitcherOpen && "rotate-180 text-white"
                  )} />
                </>
              )}
            </button>

            {/* Switcher Dropdown Popover */}
            {orgSwitcherOpen && (
              <div
                className={cn(
                  "absolute bottom-full left-3 mb-2 bg-white border border-[#E1E8E3] rounded-[16px] shadow-xl overflow-hidden z-50 text-[#1E2925]",
                  sidebarCollapsed ? "left-14 w-60" : "right-3 w-64"
                )}
              >
                <div className="px-3.5 py-2.5 bg-[#F6F8F5] border-b border-[#E1E8E3]">
                  <span className="text-[11px] font-bold text-[#66736D] uppercase tracking-wider">
                    Pilih Organisasi
                  </span>
                </div>
                <div className="p-1.5 space-y-1">
                  {AVAILABLE_ORGS.map(org => {
                    const isSelected = org.id === activeOrg.id
                    return (
                      <button
                        key={org.id}
                        onClick={() => handleSwitchOrg(org)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left transition-colors",
                          isSelected
                            ? "bg-[#DDF3EC] text-[#173F35] font-semibold"
                            : "hover:bg-[#F6F8F5] text-[#1E2925]"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0",
                          isSelected ? "bg-[#173F35] text-white" : "bg-[#E1E8E3] text-[#66736D]"
                        )}>
                          {org.short}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{org.name}</div>
                          <div className="text-[10px] text-[#66736D] truncate">{org.type}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#173F35] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                <div className="border-t border-[#E1E8E3] p-1.5">
                  <Link
                    href="/pengaturan"
                    onClick={() => setOrgSwitcherOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-medium text-[#246B56] hover:bg-[#F6F8F5] rounded-[8px] transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    Kelola Semua Organisasi
                  </Link>
                </div>
              </div>
            )}
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
          <aside className="relative flex flex-col w-64 max-w-[80vw] h-full z-50 bg-[#173F35] text-white brand-motif shadow-2xl">
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0">
              <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 bg-[#DDF3EC] rounded-lg flex items-center justify-center">
                  <span className="text-[#173F35] font-black text-sm">P</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">PilahYuk</div>
                  <div className="text-[#DDF3EC]/60 text-[10px]">Portal Mitra</div>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                aria-label="Tutup navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="px-2.5 pt-3 pb-1 text-[10px] font-bold text-[#DDF3EC]/40 tracking-wider uppercase">
                    {group.label}
                  </div>
                  {group.items.map(item => {
                    const active = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-medium transition-colors my-0.5",
                          active
                            ? "bg-[#DDF3EC] text-[#173F35] font-semibold"
                            : "text-[#DDF3EC]/80 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", active ? "text-[#173F35]" : "text-[#DDF3EC]/80")} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar / Header */}
        <header className="sticky top-0 z-20 shrink-0 bg-white border-b border-[#E1E8E3] h-16 flex items-center px-4 sm:px-6 gap-3 sm:gap-4">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-[12px] hover:bg-[#F6F8F5] text-[#1E2925] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            className="hidden lg:flex p-2 rounded-[12px] hover:bg-[#F6F8F5] text-[#66736D] hover:text-[#1E2925] transition-colors"
            onClick={() => setSidebarCollapsed(c => !c)}
            aria-label={sidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>

          {/* Interactive Global Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D] pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Cari anggota, material, batch..."
                className="w-full pl-9 pr-3 h-9 text-xs sm:text-sm border border-[#E1E8E3] rounded-[12px] bg-[#F6F8F5] text-[#1E2925] placeholder:text-[#66736D] focus:outline-none focus:border-[#246B56] focus:bg-white transition-all shadow-none"
                aria-label="Cari global"
              />
            </div>

            {/* Search Suggestions Popover */}
            {searchFocused && searchQuery.trim().length > 0 && (
              <div
                className="absolute left-0 top-full mt-2 w-full sm:w-96 bg-white border border-[#E1E8E3] rounded-[16px] shadow-xl overflow-hidden z-50 text-[#1E2925]"
                style={{ boxShadow: "0 8px 30px rgba(23,63,53,0.12)" }}
              >
                <div className="px-3.5 py-2 bg-[#F6F8F5] border-b border-[#E1E8E3] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#66736D] uppercase tracking-wider">
                    Hasil Pencarian Cepat
                  </span>
                  <span className="text-[10px] text-[#66736D]">{searchResults.length} ditemukan</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#E1E8E3]/60">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.link}
                        onClick={() => { setSearchFocused(false); setSearchQuery("") }}
                        className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#F6F8F5] transition-colors group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-[#DDF3EC] text-[#173F35]">
                              {item.type}
                            </span>
                            <span className="text-xs font-semibold text-[#1E2925] group-hover:text-[#246B56] truncate">
                              {item.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#66736D] mt-0.5 truncate">{item.meta}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#66736D] group-hover:text-[#246B56] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-[#66736D]">
                      Tidak ada hasil yang cocok dengan &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Header Utilities */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Interactive Sync Indicator */}
            <SyncIndicator
              pendingCount={pendingSyncCount}
              isOnline={true}
              onOpenOutbox={() => setOutboxOpen(true)}
              compact
            />

            {/* Interactive Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(prev => !prev); setProfileOpen(false) }}
                className={cn(
                  "relative p-2 rounded-[12px] transition-colors focus:outline-none",
                  notifOpen
                    ? "bg-[#DDF3EC] text-[#173F35]"
                    : "hover:bg-[#F6F8F5] text-[#66736D] hover:text-[#1E2925]"
                )}
                aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#E7A34B] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Panel */}
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E1E8E3] rounded-[16px] overflow-hidden z-50 text-[#1E2925]"
                  style={{ boxShadow: "0 10px 32px rgba(23,63,53,0.12)" }}
                >
                  {/* Popover Header */}
                  <div className="px-4 py-3 border-b border-[#E1E8E3] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1E2925]">Notifikasi</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-[#E7A34B] text-white text-[10px] font-bold rounded-full">
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

                  {/* Filter tabs */}
                  <div className="flex border-b border-[#E1E8E3] bg-[#F6F8F5] px-3 pt-1">
                    <button
                      onClick={() => setNotifFilter("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors",
                        notifFilter === "all"
                          ? "border-[#173F35] text-[#173F35]"
                          : "border-transparent text-[#66736D] hover:text-[#1E2925]"
                      )}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter("unread")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors",
                        notifFilter === "unread"
                          ? "border-[#173F35] text-[#173F35]"
                          : "border-transparent text-[#66736D] hover:text-[#1E2925]"
                      )}
                    >
                      Belum Dibaca ({unreadCount})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E1E8E3]">
                    {filteredNotifs.length > 0 ? (
                      filteredNotifs.map(n => {
                        const icon =
                          n.type === "warning" ? <AlertTriangle className="w-4 h-4 text-[#E7A34B]" /> :
                          n.type === "success" ? <CheckCircle2 className="w-4 h-4 text-[#3D9274]" /> :
                          <Clock className="w-4 h-4 text-[#286A9B]" />

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id, n.link)}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer group",
                              n.read ? "bg-white hover:bg-[#F6F8F5]" : "bg-[#F4FAF7] hover:bg-[#EDF7F2]"
                            )}
                          >
                            <div className="mt-0.5 shrink-0">{icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-xs font-semibold truncate group-hover:text-[#246B56] transition-colors",
                                n.read ? "text-[#66736D]" : "text-[#1E2925]"
                              )}>
                                {n.title}
                              </div>
                              <div className="text-[11px] text-[#66736D] mt-0.5 leading-snug line-clamp-2">
                                {n.desc}
                              </div>
                              <div className="text-[10px] text-[#66736D]/70 mt-1">{n.time}</div>
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-[#3D9274] mt-1 shrink-0" />
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-[#66736D]">
                        Tidak ada notifikasi yang ditemukan
                      </div>
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="px-4 py-2.5 bg-[#F6F8F5] border-t border-[#E1E8E3] text-center">
                    <Link
                      href="/bantuan"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-semibold text-[#246B56] hover:text-[#173F35] transition-colors inline-flex items-center gap-1"
                    >
                      Pusat Informasi & Log Sengketa
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive User Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(prev => !prev); setNotifOpen(false) }}
                className={cn(
                  "flex items-center gap-2 rounded-[12px] px-2 py-1.5 transition-all focus:outline-none group",
                  profileOpen
                    ? "bg-[#DDF3EC]"
                    : "hover:bg-[#F6F8F5]"
                )}
                aria-label="Menu profil pengguna"
                aria-expanded={profileOpen}
              >
                <div className="w-8 h-8 bg-[#173F35] border border-[#246B56] rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <span className="text-white text-xs font-bold">{getInitials(userName)}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-[#1E2925] leading-tight truncate">{userName}</div>
                  <div className="text-[10px] text-[#66736D] truncate">{activeOrg.roleLabel}</div>
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-[#66736D] hidden sm:block transition-transform duration-200 group-hover:text-[#1E2925]",
                  profileOpen && "rotate-180 text-[#173F35]"
                )} />
              </button>

              {/* Profile Dropdown Popover */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E1E8E3] rounded-[16px] overflow-hidden z-50 text-[#1E2925]"
                  style={{ boxShadow: "0 10px 32px rgba(23,63,53,0.12)" }}
                >
                  {/* User Profile Card */}
                  <div className="p-4 border-b border-[#E1E8E3] bg-[#F6F8F5]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#173F35] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {getInitials(userName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#1E2925] truncate">{userName}</div>
                        <div className="text-[11px] text-[#66736D] truncate">{activeOrg.roleLabel}</div>
                        <div className="inline-block mt-1 px-2 py-0.5 bg-[#DDF3EC] text-[#173F35] text-[10px] font-bold rounded-md truncate max-w-full">
                          {activeOrg.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Menu Items */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/pengaturan"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1E2925] hover:bg-[#F6F8F5] rounded-[10px] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#66736D]" />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      href="/pengaturan"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1E2925] hover:bg-[#F6F8F5] rounded-[10px] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#66736D]" />
                      <span>Pengaturan Akun</span>
                    </Link>
                    <Link
                      href="/bantuan"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1E2925] hover:bg-[#F6F8F5] rounded-[10px] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#66736D]" />
                      <span>Bantuan & FAQ</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-[#E1E8E3] p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#B54747] hover:bg-[#FCEBEB] rounded-[10px] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Sesi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── SYNC OUTBOX DRAWER / MODAL ── */}
        {outboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setOutboxOpen(false)}
            />
            <div
              className="relative w-full max-w-lg bg-white rounded-[16px] border border-[#E1E8E3] shadow-2xl overflow-hidden z-10"
              style={{ boxShadow: "0 16px 40px rgba(23,63,53,0.18)" }}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#173F35] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#DDF3EC]/10 border border-[#DDF3EC]/20 flex items-center justify-center">
                    <RefreshCw className={cn("w-4 h-4 text-[#DDF3EC]", isSyncing && "animate-spin")} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Status Sinkronisasi & Outbox</h3>
                    <p className="text-[11px] text-[#DDF3EC]/70">PilahYuk Offline-First Sync Architecture</p>
                  </div>
                </div>
                <button
                  onClick={() => setOutboxOpen(false)}
                  className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-[#F6F8F5] rounded-[12px] border border-[#E1E8E3]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3D9274] animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-[#1E2925]">Status Jaringan: Terhubung (Online)</div>
                      <div className="text-[11px] text-[#66736D]">Koneksi server API normal · Latency 42ms</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-[#DDF3EC] text-[#173F35]">
                    Aktif
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#1E2925] uppercase tracking-wider">
                      Item Antrean Outbox ({pendingSyncCount})
                    </h4>
                    <span className="text-[11px] text-[#66736D]">Tersimpan di IndexedDB lokal</span>
                  </div>

                  {pendingSyncCount > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      <div className="p-3 bg-white border border-[#E7A34B]/30 rounded-[12px] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#1E2925]">Penimbangan #TX-8091</div>
                          <div className="text-[11px] text-[#66736D]">Reza Pratama · 2,0 kg Plastik PET (Rp 24.000)</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#FBF1DF] text-[#A86712] text-[10px] font-bold">
                          Pending Sync
                        </span>
                      </div>
                      <div className="p-3 bg-white border border-[#E7A34B]/30 rounded-[12px] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#1E2925]">Penimbangan #TX-8092</div>
                          <div className="text-[11px] text-[#66736D]">Nurul Hidayah · 4,5 kg Kertas HVS (Rp 2.250)</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#FBF1DF] text-[#A86712] text-[10px] font-bold">
                          Pending Sync
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-[#F6F8F5] rounded-[12px] border border-[#E1E8E3]">
                      <CheckCircle2 className="w-8 h-8 text-[#3D9274] mx-auto mb-2" />
                      <div className="text-xs font-bold text-[#1E2925]">Semua Data Telah Tersinkronisasi</div>
                      <div className="text-[11px] text-[#66736D] mt-0.5">Tidak ada antrean pending di outbox lokal</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-[#F6F8F5] border-t border-[#E1E8E3] flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setOutboxOpen(false)}
                  className="px-4 py-2 border border-[#E1E8E3] rounded-[10px] text-xs font-semibold text-[#66736D] hover:bg-white transition-colors"
                >
                  Tutup
                </button>
                {pendingSyncCount > 0 && (
                  <button
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-[#173F35] text-white rounded-[10px] text-xs font-semibold hover:bg-[#246B56] disabled:opacity-60 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                    {isSyncing ? "Menyinkronkan Data..." : `Sinkronkan Sekarang (${pendingSyncCount})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SCROLLABLE PAGE BODY ── */}
        <main
          id="main-content"
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
