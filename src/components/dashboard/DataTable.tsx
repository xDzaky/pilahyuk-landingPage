// src/components/dashboard/DataTable.tsx
"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { EmptyState, SkeletonTable } from "./EmptyState"

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  pageSize?: number
  bulkActions?: React.ReactNode
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyTitle = "Tidak ada data",
  emptyDescription,
  emptyAction,
  searchPlaceholder = "Cari...",
  searchKeys,
  pageSize = 10,
  bulkActions,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(pageSize)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search || !searchKeys) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q))
    )
  }, [data, search, searchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = String((a as Record<string,unknown>)[sortKey] ?? "")
      const bv = String((b as Record<string,unknown>)[sortKey] ?? "")
      return sortDir === "asc" ? av.localeCompare(bv, "id") : bv.localeCompare(av, "id")
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / perPage)
  const paged = sorted.slice((page - 1) * perPage, page * perPage)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  if (isLoading) return <SkeletonTable rows={5} />

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {searchKeys && (
          <div className="relative flex-1 min-w-48 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55615B]" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 h-9 text-sm border border-[#D2DCD5] rounded-[6px] bg-white text-[#1E2925] placeholder:text-[#55615B] focus:outline-none focus:border-[#246B56] focus:ring-1 focus:ring-[#DDF3EC]"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#55615B]">Baris per halaman:</span>
          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
            className="text-xs border border-[#D2DCD5] rounded-[6px] px-2 py-1 bg-white text-[#1E2925] focus:outline-none focus:border-[#246B56]"
          >
            {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {selected.size > 0 && bulkActions && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-[#55615B]">{selected.size} dipilih</span>
            {bulkActions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-[6px] border border-[#D2DCD5] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b border-[#D2DCD5] bg-[#E9EDE9]">
                {bulkActions && (
                  <th className="w-10 px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded w-4 h-4"
                      checked={selected.size === paged.length && paged.length > 0}
                      onChange={e => {
                        if (e.target.checked) setSelected(new Set(paged.map(keyExtractor)))
                        else setSelected(new Set())
                      }}
                      aria-label="Pilih semua baris"
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide whitespace-nowrap",
                      col.sortable && "cursor-pointer select-none hover:text-[#1E2925]",
                      col.className
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        sortKey === col.key
                          ? sortDir === "asc"
                            ? <ChevronUp className="w-3 h-3" />
                            : <ChevronDown className="w-3 h-3" />
                          : <ChevronsUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (bulkActions ? 1 : 0)} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : (
                paged.map(row => {
                  const id = keyExtractor(row)
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "border-b border-[#D2DCD5] last:border-0 transition-colors",
                        onRowClick && "cursor-pointer",
                        selected.has(id) ? "bg-[#DDF3EC]/30" : "hover:bg-[#EDF1EC]"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {bulkActions && (
                        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded w-4 h-4"
                            checked={selected.has(id)}
                            onChange={() => toggleSelect(id)}
                            aria-label={`Pilih baris ${id}`}
                          />
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={col.key} className={cn("px-4 py-3", col.className)}>
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#D2DCD5] bg-[#F6F8F5]">
            <span className="text-xs text-[#55615B]">
              {(page-1)*perPage+1}–{Math.min(page*perPage, sorted.length)} dari {sorted.length} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                className="p-1.5 rounded-[4px] hover:bg-[#D2DCD5] disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-[#1E2925]" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-7 h-7 rounded-[4px] text-xs font-medium",
                      page === p
                        ? "bg-[#173F35] text-white"
                        : "hover:bg-[#D2DCD5] text-[#1E2925]"
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-[4px] hover:bg-[#D2DCD5] disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-[#1E2925]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
