// src/hooks/useBankAccounts.ts
import { useCallback, useState } from "react";
import {
  type BankAccountInput,
  type BankAccountRow,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../Services/addAccount";

export function useBankAccounts(initial: BankAccountRow[] = []) {
  const [items, setItems] = useState<BankAccountRow[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async (input: BankAccountInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createBankAccount(input);
      if (!res.success) throw new Error(res.error || "Create failed");

      // حاول تجيب الـ Id لو السيرفر رجعه
      const newId =
        (res.row as any)?.Id ??
        (res.decrypted as any)?.data?.Id ??
        Date.now(); // fallback

      const row: BankAccountRow = { Id: newId, ...input };
      setItems((prev) => [...prev, row]);
      return row;
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string | number, input: BankAccountInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBankAccount(id, input);
      if (!res.success) throw new Error(res.error || "Update failed");
      setItems((prev) =>
        prev.map((x) => (String(x.Id) === String(id) ? { Id: id, ...input } : x))
      );
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteBankAccount(id);
      if (!res.success) throw new Error(res.error || "Delete failed");
      setItems((prev) => prev.filter((x) => String(x.Id) !== String(id)));
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, add, update, remove, setItems };
}
