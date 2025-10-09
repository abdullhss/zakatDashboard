import { useQuery } from "@tanstack/react-query";
import { getPrivileges, type RoleCode } from "../Services/getPrivelge";

export function useGetPrivilege(
  roleCode: RoleCode | string = "M",
  offset: number = 0,
  fetch: number = 50
) {
  const key = String(roleCode ?? "M").toUpperCase() || "M";
  return useQuery({
    queryKey: ["privileges", key, offset, fetch],
    queryFn: () => getPrivileges(key, offset, fetch),
    keepPreviousData: true,
  });
}
