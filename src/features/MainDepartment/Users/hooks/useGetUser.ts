// src/features/Users/hooks/useGetUsers.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import type { AnyRec, NormalizedSummary } from "../../../../api/apiClient";
import { getWorkUsersData } from "../Services/getUsers";

export type UseGetUsersOptions = {
  startNum?: number;   // 1-based
  count?: number;
  encSQLRaw?: string;  // WHERE/ORDER BY (تُشفّر داخليًا)
  dataToken?: string;
  auto?: boolean;      // fetch عند التركيب
};

export function useGetUsers(opts: UseGetUsersOptions = {}) {
  const {
    startNum = 1,
    count = 50,
    encSQLRaw,
    dataToken,
    auto = true,
  } = opts;

  const [loading, setLoading] = useState<boolean>(auto);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AnyRec[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [serverTime, setServerTime] = useState<string | undefined>(undefined);
  const [lastSummary, setLastSummary] = useState<NormalizedSummary | null>(null);
  const [dec , setDec] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getWorkUsersData(startNum, count, encSQLRaw, dataToken);
      setDec(summary.decrypted)
      
      setLastSummary(summary);
      setRows(summary.rows ?? []);
      setTotal(summary.totalRows ?? null);
      setServerTime(summary.serverTime);
      if (!summary.flags.OK && summary.message) {
        setError(summary.message || "Unknown error");
      }
    } catch (e: any) {
      setError(e?.message || "Network/Unknown error");
    } finally {
      setLoading(false);
    }
  }, [startNum, count, encSQLRaw, dataToken]);

  useEffect(() => {
    if (auto) fetchUsers();
  }, [auto, fetchUsers]);

  const state = useMemo(
    () => ({
      dec,
      loading,
      error,
      rows,
      total,
      serverTime,
      flags: lastSummary?.flags,
      summary: lastSummary,
    }),
    [loading, error, rows, total, serverTime, lastSummary]
  );

  return { ...state, refetch: fetchUsers };
}
