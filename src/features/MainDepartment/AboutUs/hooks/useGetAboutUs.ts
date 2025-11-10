import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { getAboutUs } from '../Services/getAboutUs'; 
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

export interface AboutUsData {
  rows: AnyRec[]; 
  totalRows: number | null;
  data: any;
}

// دالة تحليل الـ JSON
function safeParseAboutUsData(summary: NormalizedSummary): AnyRec[] {
  const resultRow = summary.Result?.[0] ?? summary.rows?.[0]; 
  const jsonString = resultRow?.AboutUsData; 

  if (jsonString && typeof jsonString === 'string') {
    try {
      const parsed = JSON.parse(jsonString.trim());
      return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean); 
    } catch (e) {
      console.error("Error parsing AboutUsData JSON:", e);
      return [];
    }
  }

  return [];
}

export function useGetContactUs(): UseQueryResult<AboutUsData, Error> {
  const queryKey = ["about-us-content", 1];

  return useQuery<AboutUsData, Error>({
    queryKey,
    queryFn: async () => {
      const summary: NormalizedSummary = await getAboutUs(1);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل جلب محتوى 'من نحن'.");
      }

      const finalRows = safeParseAboutUsData(summary);

      return {
        data: summary.decrypted.data,
        rows: finalRows,
        totalRows: finalRows.length,
      } as AboutUsData;
    },
    staleTime: 0,                 // اعتبر الداتا قديمة دايمًا
    cacheTime: 0,                 // مفيش كاش
    refetchOnMount: "always",     // كل مرة يدخل الصفحة ينده API
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
