import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getActiveOffices } from "../Services/getActiveOffices";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

export interface Office {
  Id: number;
  OfficeName: string;
}

export interface ZakatType {
  Id: number;
  ZakatTypeName: string;
}

export interface ActiveOfficesData {
  rows: Office[];
  zakatTypes: ZakatType[]; 
  totalRows: number | null;
}

export function useGetActiveOffices(): UseQueryResult<ActiveOfficesData, Error> {
  const { userId } = getSession();
  const currentUserId = userId ?? 0;

  const queryKey = ["active-offices", currentUserId];

  return useQuery<ActiveOfficesData, Error>({
    queryKey,
    queryFn: async () => {
      const summary: NormalizedSummary = await getActiveOffices(currentUserId);
    
      console.log(summary, "SUMMARYYYYYYYYYYYYYYYYYYYYYYYYYYYYYasljd asjldb saljdb this is summary");
      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "لم يتم الجلب ×××");
      }

      let parsedOfficeRows: Office[] = [];
      let parsedZakatTypes: ZakatType[] = [];

      const rawOfficeData = summary?.rows?.[0]?.OfficesData ?? summary?.rows ?? [];
      const rawZakatTypesData = summary?.rows?.[0]?.ZakatTypesData ?? [];
// console.log(rawOfficeData);
// console.log("ASPODJNIPOASNDPIANDPAIS");
console.log(rawZakatTypesData,"ZAKATTYPES 55555555555555555555555555");


      try {
        parsedOfficeRows = 
          typeof rawOfficeData === "string" ? JSON.parse(rawOfficeData) : rawOfficeData;
        
        parsedZakatTypes = 
          typeof rawZakatTypesData === "string" ? JSON.parse(rawZakatTypesData) : rawZakatTypesData;
console.log(parsedZakatTypes,"sadfasdfgpiwehfoiewhfnipoeFHNIOFHNWEIOwe;fuiweig");

      } catch (err) {
        console.error(" خطأ في تحويل البيانات (مكاتب أو زكاة):", err);
      }

      return {
        rows: parsedOfficeRows,
        zakatTypes: parsedZakatTypes,
        totalRows: summary.totalRows ?? parsedOfficeRows.length,
      } as ActiveOfficesData;
    },
    staleTime: 60000,
  });
}