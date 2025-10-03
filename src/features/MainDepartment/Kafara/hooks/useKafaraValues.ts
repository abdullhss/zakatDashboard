// src/features/Kafara/hooks/useGetKafaraValues.ts
import { useQuery } from "@tanstack/react-query";
import { getKafaraValues } from "../services/getKafaraValues";

type KafaraData = {
  rows: Array<{ Id?: number; KafaraValue?: number }>;
  currentValue: number | null;
  totalRows: number | null;
};

export function useGetKafaraValues(userId: number) {
  return useQuery<KafaraData, Error>({
    queryKey: ["kafaraValue", userId],
    queryFn: async () => {
      const summary = await getKafaraValues(userId);

      // rows جاية مفكوكة من helper (بتقرأ *Data وتحوّل الـ JSON)
      const rows = (summary.rows ?? []) as Array<{ Id?: number; KafaraValue?: number }>;

      // أحيانًا السيرفر يبعتها كنص داخل Result[0].KafaraValueData — safety parsing
      let current = rows?.[0]?.KafaraValue;
      if (current == null && Array.isArray(rows) && rows.length === 0) {
        const r0 = (summary as any)?.decrypted?.data?.Result?.[0];
        const asStr = r0?.KafaraValueData;
        if (typeof asStr === "string") {
          try {
            const arr = JSON.parse(asStr);
            current = arr?.[0]?.KafaraValue;
          } catch {}
        }
      }

      const currentValue = Number.isFinite(Number(current)) ? Number(current) : null;

      return {
        rows,
        currentValue,
        totalRows: summary.totalRows,
      };
    },
    staleTime: 60_000,
  });
}
