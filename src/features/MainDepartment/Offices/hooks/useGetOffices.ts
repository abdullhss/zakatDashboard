import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOffices } from "../Services/getOffice";

export function useGetOffices(offset: number, limit: number , cityId : number) {
  return useQuery({
    queryKey: ["offices", offset, limit , cityId],
    queryFn: async () => {
      const res = await getOffices(offset, limit , cityId);
      return {
        rows: res.rows ?? [],
        totalRows: res.totalRows ?? 0,
        decrypted : res.decrypted
      };
    },
    placeholderData: keepPreviousData,
  });
}