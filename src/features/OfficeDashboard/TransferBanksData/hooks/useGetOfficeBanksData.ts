// src/features/Transfers/hooks/useGetOfficeBanksData.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getOfficeBanksData, type OfficeBankParams } from '../Services/getOfficeBanksData'; // تأكد من المسار
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

export interface OfficeBanksData {
    rows: AnyRec[];
    totalRows: number | null;
}

export function useGetOfficeBanksData(
    params: OfficeBankParams,
    offset: number = 0, 
    limit: number = 20,
    enabled: boolean = true 
): UseQueryResult<OfficeBanksData, Error> {
    
    const queryKey = ["office-banks", params.officeId, params.accountTypeId, params.serviceTypeId, params.paymentMethodId];

    return useQuery<OfficeBanksData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            const summary: NormalizedSummary = await getOfficeBanksData(params, offset, limit);

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل جلب بيانات الحسابات البنكية للمكتب.");
            }
            
            return {
                rows: summary.rows,
                totalRows: summary.totalRows,
            } as OfficeBanksData;
        },
        staleTime: 60000, 
        enabled: enabled,
    });
}