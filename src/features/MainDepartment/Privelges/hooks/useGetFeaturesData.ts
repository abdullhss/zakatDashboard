// src/features/MainDepartment/Privelges/hooks/useGetFeatures.ts
import { useQuery } from "@tanstack/react-query";
import { getFeatures } from "../Services/getFeaturesData";

/**
 * React Query hook لجلب الميزات حسب كود الدور مباشرة.
 * @param roleCode كود الدور (M/O/A/...) – افتراضيًا "M" إن لم يُمرّر
 */
export function useGetFeatures(roleCode?: string) {
  const key = (roleCode ?? "M").toUpperCase();
  return useQuery({
    queryKey: ["features", key],
    queryFn: () => getFeatures(key),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}
