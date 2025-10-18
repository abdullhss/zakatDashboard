// src/features/MainDepartment/Privelges/Privileges.tsx
import { Box, HStack, Text, useColorModeValue, useToast, Badge } from "@chakra-ui/react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";

import type { AnyRec } from "../../../api/apiClient";
import { useGetPrivilege } from "./hooks/useGetPrivelge";
import { getSession } from "../../../session";

type Row = {
  id: string | number;
  name: string;
  isActive: boolean;
  code?: string | number | null;
  type?: string | null;
};

const PAGE_SIZE = 10;

export default function Privileges() {
  const navigate = useNavigate();
  const toast = useToast();

  // الدور من السيشن
  const { role, mainUser } = getSession();
  const roleCode = (role || "M") as "M" | "O";

  const [page, setPage] = useState(1);

  // جلب الصلاحيات
  const { data, isLoading, isError, error, refetch } = useGetPrivilege(roleCode, 0, 500);

  // تطبيع الداتا
  const rows: Row[] = useMemo(() => {
    const src = (data?.rows ?? []) as AnyRec[];
    return src.map((r) => ({
      id:
        r.Id ??
        r.GroupRight_Id ??
        r.GroupRightId ??
        r.RightId ??
        r.Code ??
        r.id ??
        `${Math.random()}`,
      name: r.GroupRightName ?? r.GroupRight_Name ?? r.RightName ?? r.Name ?? r.name ?? "",
      isActive: Boolean(r.IsActive ?? r.Active ?? r.isActive ?? true),
      code: r.Code ?? r.RightCode ?? r.code ?? null,
      type: r.GroupRightType ?? r.Type ?? roleCode,
    }));
  }, [data?.rows, roleCode]);

  const totalRows =
    typeof data?.totalRows === "number" ? data.totalRows : (data?.rows?.length ?? rows.length);

  const titleClr = useColorModeValue("gray.700", "gray.100");

  // بناء رابط صفحة التعديل
  const buildUpdateUrl = (id: string | number, rc: "M" | "O") =>
    `/maindashboard/privelges/update?groupId=${encodeURIComponent(String(id))}&featureType=${
      rc === "M" ? "1" : "2"
    }&role=${rc}`;

  // فتح شاشة التعديل
  const onEditRow = useCallback(
    (row: AnyRec) => {
      const id = (row as Row).id;
      if (!id) {
        toast({ title: "لا يمكن تحديد الصلاحية للتعديل", status: "warning" });
        return;
      }
      navigate(buildUpdateUrl(id, roleCode), { state: { row } });
    },
    [navigate, roleCode, toast]
  );

  // أعمدة الجدول: اسم + إجراءات فقط
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "اسم الصلاحية",
        width: "70%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color={titleClr}>
            {(row as Row).name}
          </Text>
        ),
      },
      {
        key: "__actions",
        header: "الإجراءات",
        width: "30%",
        align: "center",
        render: (row: AnyRec) => (
          <SharedButton size="sm" variant="secondary" onClick={() => onEditRow(row)}>
            تعديل
          </SharedButton>
        ),
      },
    ],
    [onEditRow, titleClr]
  );

  const onRefresh = useCallback(() => {
    refetch();
    toast({ title: "تم تحديث القائمة", status: "success", duration: 1200 });
  }, [refetch, toast]);

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <HStack>
          {mainUser?.GroupRightName ? (
            <Badge variant="outline" colorScheme="blue">
              مجموعتي: {mainUser.GroupRightName}
            </Badge>
          ) : null}
        </HStack>

        <HStack>
          {/* <SharedButton variant="secondary" onClick={onRefresh}>تحديث</SharedButton> */}
          <SharedButton variant="brandGradient" to={`/maindashboard/privelges/add`}>
            إضافة
          </SharedButton>
        </HStack>
      </HStack>

      <DataTable
        title="صلاحيات المجموعات"
        data={(rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) as unknown) as AnyRec[]}
        columns={columns}
        totalRows={totalRows}
        stickyHeader
        loading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEditRow={onEditRow}
      />

      {rows.length === 0 && (
        <Text mt={3} color="gray.500">لا توجد بيانات لصلاحيات هذا الدور.</Text>
      )}
    </Box>
  );
}
