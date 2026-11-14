"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

export interface ApiState<T> {
  data: T | null;
  meta: ApiMeta | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApi<T>(path: string | null, refreshMs?: number): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const first = useRef(true);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    if (first.current) setLoading(true);
    setError(null);

    fetch(path, { credentials: "same-origin", signal: controller.signal })
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          throw new Error("Sesi berakhir");
        }
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error?.message ?? "Gagal memuat data");
        return json;
      })
      .then((json) => {
        setData(json?.data ?? null);
        setMeta(json?.meta ?? null);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        first.current = false;
        setLoading(false);
      });

    return () => controller.abort();
  }, [path, tick]);

  useEffect(() => {
    if (!refreshMs || !path) return;
    const timer = window.setInterval(reload, refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs, path, reload]);

  return { data, meta, loading, error, reload };
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "Operasi gagal");
  return (json?.data ?? json) as T;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(value ?? 0);
}
