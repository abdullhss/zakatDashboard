// src/features/MainDepartment/ZakahGold/hooks/useGetZakahValue.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getZakahValue } from '../services/getZakahValue'; 
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 
import { getSession } from '../../../../session'; 

// دالة مساعدة لتحليل الـ JSON (لتجنب تكرار الكود)
function parseNestedZakahData(data: any, key: string): AnyRec[] {
    const result0 = data?.rows?.[0]; 
    if (!result0 || typeof result0[key] !== 'string') return [];
    
    try {
        return JSON.parse(result0[key].trim());
    } catch {
        return [];
    }
}

// دالة مساعدة لاستخلاص السعر (GoldPrice)
const extractPrice = (rows: AnyRec[], valueName: string): string => {
    // نستخدم includes لمرونة أكبر (يحتوي على '24' أو 'الفضة')
    const record = rows.find(r => (r.GoldValueName || '').includes(valueName)) || {};
    // نستخدم GoldPrice أو GoldValueGrame كاحتياطي
    return String(record.GoldPrice ?? record.ZakahValue ?? '—'); 
};


export interface ProgramSettingsData {
    settings: { gold24: string, silver: string } | null;
}

export function useGetZakahValue(): UseQueryResult<ProgramSettingsData, Error> {
    const { userId } = getSession(); 
    const currentUserId = userId ?? 0;

    return useQuery<ProgramSettingsData, Error>({
        queryKey: ["currentZakahPrices", currentUserId],
        queryFn: async () => {
            const summary: NormalizedSummary = await getZakahValue(currentUserId);
            
            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل جلب قيمة الذهب.");
            }
            
            // 1. تحليل سلاسل JSON المخبأة
            const goldRows = parseNestedZakahData(summary, 'ZakatGoldValues');
            const silverRows = parseNestedZakahData(summary, 'ZakatSilverValues');
            
            // 2. استخلاص القيم المطلوبة
            const gold24 = extractPrice(goldRows, '24');
            const silver = extractPrice(silverRows, 'الفضة'); // ✅ تم التعديل إلى 'الفضة'
            
            return {
                settings: { gold24, silver },
            } as ProgramSettingsData;
        },
        staleTime: 60000, 
    });
}