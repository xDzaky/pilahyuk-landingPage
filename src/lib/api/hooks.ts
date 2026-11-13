// Utility hooks for TanStack Query — PilahYuk API calls
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ── Auth ──
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<{ id: string; name: string; email: string; role: string; org_id?: string; org_name?: string }>("/api/v1/me"),
  });
}

// ── Communities ──
export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: () => api.get<unknown[]>("/api/v1/communities"),
  });
}

// ── Materials ──
export function useMaterials() {
  return useQuery({
    queryKey: ["materials"],
    queryFn: () => api.get<unknown[]>("/api/v1/materials"),
  });
}

// ── Collection Requests ──
export function useCollectionRequests() {
  return useQuery({
    queryKey: ["collection-requests"],
    queryFn: () => api.get<unknown[]>("/api/v1/collection-requests"),
  });
}

export function useCreateCollectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post("/api/v1/collection-requests", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collection-requests"] }),
  });
}

// ── Weighing Transactions ──
export function useWeighingTransactions() {
  return useQuery({
    queryKey: ["weighing-transactions"],
    queryFn: () => api.get<unknown[]>("/api/v1/waste-bank/transactions"),
  });
}

export function useCreateWeighingTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post("/api/v1/waste-bank/transactions", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weighing-transactions"] }),
  });
}

// ── Batches ──
export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: () => api.get<unknown[]>("/api/v1/batches"),
  });
}

// ── Disputes ──
export function useDisputes() {
  return useQuery({
    queryKey: ["disputes"],
    queryFn: () => api.get<unknown[]>("/api/v1/disputes"),
  });
}

// ── Admin ──
export function useAdminOrganizations(params?: { status?: string; q?: string }) {
  return useQuery({
    queryKey: ["admin-organizations", params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      return api.get<unknown[]>(`/api/v1/admin/organizations?${qs.toString()}`);
    },
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: () => api.get<unknown>("/api/v1/admin/system/health"),
    refetchInterval: 60_000,
  });
}

// ── Member Ledger ──
export function useMemberLedger(memberId: string | null) {
  return useQuery({
    queryKey: ["ledger", memberId],
    queryFn: () => api.get<unknown>(`/api/v1/waste-bank/members/${memberId}/ledger`),
    enabled: !!memberId,
  });
}

export function useMemberBalance(memberId: string | null) {
  return useQuery({
    queryKey: ["balance", memberId],
    queryFn: () => api.get<unknown>(`/api/v1/waste-bank/members/${memberId}/balance`),
    enabled: !!memberId,
  });
}

// ── Reports ──
export function useReport(period: string) {
  return useQuery({
    queryKey: ["report", period],
    queryFn: () => api.get<unknown>(`/api/v1/waste-bank/reports/${period}`),
    enabled: !!period,
  });
}
