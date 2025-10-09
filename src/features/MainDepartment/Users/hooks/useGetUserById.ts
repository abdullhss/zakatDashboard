// src/features/MainDepartment/Users/hooks/useGetUserById.ts
import { useQuery } from "@tanstack/react-query";
import { useGetUsers } from "./useGetUser";

export function useGetUserById(id?: string | number) {
  const encSQLRaw = id ? `WHERE UserId = ${Number(id)}` : "";
  // نعيد استخدام نفس هوك القائمة لكن نطلب صف واحد
  const base = useGetUsers({
    startNum: 1,
    count: 1,
    encSQLRaw,
    auto: !!id,
  });

  const row = (base.rows && base.rows[0]) || null;
  return { ...base, row };
}
