import { useCallback, useMemo, useState } from "react";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { deleteUser, type DeleteUserInput } from "../Services/deleteUser";

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [summary, setSummary] = useState<NormalizedSummary | null>(null);

  const submit = useCallback(async (payload: DeleteUserInput) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await deleteUser(payload);
      console.log(res);
      
      // فشل داخلي من السيرفر؟
      if (res.flags.FAILURE || res.flags.INTERNAL_ERROR) {
        throw new Error(res.message || "تعذّر الحذف.");
      }
      setSummary(res);
      return res;
    } catch (e: any) {
      const msg = e?.message || "Network/Unknown error";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({ loading, error, summary, submit }), [loading, error, summary, submit]);
}
