// src/features/AboutUs/hooks/useGetAboutUs.ts (المُعدَّل)

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAboutUs } from '../Services/getAboutUs'; 
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

export interface AboutUsData {
  rows: AnyRec[]; 
  totalRows: number | null;
  data : any;
}

// دالة مساعدة لتحليل الـ JSON الخاص بـ AboutUs
function safeParseAboutUsData(summary: NormalizedSummary): AnyRec[] {
  // 🛑 FIX: البحث الموحد عن سلسلة JSON في مسارين محتملين (Result أو rows)
  const resultRow = summary.Result?.[0] ?? summary.rows?.[0]; 

  // 🛑 البحث عن سلسلة JSON في حقل AboutUsData
  const jsonString = resultRow?.AboutUsData; 

  if (jsonString && typeof jsonString === 'string') {
    try {
      const parsed = JSON.parse(jsonString.trim()); 
      // التأكد من أن النتيجة مصفوفة أو تحويلها إلى مصفوفة (حيث نتوقع كائن واحد)
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
      
      // 🛑 تمرير الـ summary الكاملة للتحليل الآمن
      const finalRows = safeParseAboutUsData(summary);
      
      return {
        data : summary.decrypted.data ,
        rows: finalRows,
        totalRows: finalRows.length,
      } as AboutUsData;
    },
    staleTime: 60000, 
  });
}