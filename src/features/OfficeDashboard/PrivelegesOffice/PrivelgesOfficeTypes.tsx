// src/features/OfficeDashboard/PrivelgesOfficeTypes.tsx
import { Box, HStack, Switch, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";

import type { AnyRec } from "../../../api/apiClient";
import { useGetPrivilege } from "../../MainDepartment/Privelges/hooks/useGetPrivelge";
import { getSession } from "../../../session";

type Row = {
  id: string | number;
  name: string;
  isActive: boolean;
  code?: string | number | null;
  type?: string | null;
};

const PAGE_SIZE = 10;

export default function PrivelgesOfficeTypes() {
  const toast = useToast();
  const navigate = useNavigate();
  const { mainUser } = getSession();
  const titleClr = useColorModeValue("gray.700", "gray.100");

  // الدور ثابت "O" (مكاتب)
  const roleCode: "M" | "O" = "O";

  // ترقيم
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  // جلب الصلاحيات لدور O
  const { data, isLoading, isError, error, refetch } = useGetPrivilege(roleCode, offset, PAGE_SIZE);

  // تطبيع الصفوف
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
      name: r.GroupRight_Name ?? r.GroupRightName ?? r.RightName ?? r.Name ?? r.name ?? "",
      isActive: Boolean(r.IsActive ?? r.Active ?? r.isActive ?? true),
      code: r.Code ?? r.RightCode ?? r.code ?? null,
      type: r.GroupRightType ?? r.Type ?? roleCode,
    }));
  }, [data?.rows, roleCode]);

  const pageRows = rows.slice(0, PAGE_SIZE);
  const totalRows =
    typeof data?.totalRows === "number" ? data.totalRows : (data?.rows?.length ?? rows.length);

  // أعمدة الجدول
  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "الكود",
        width: "16%",
        render: (row: AnyRec) => <Text color="gray.600">{(row as Row).code ?? "—"}</Text>,
      },
      {
        key: "isActive",
        header: "الحالة",
        width: "18%",
        render: (row: AnyRec) => {
          const r = row as Row;
          return (
            <>
              <Switch isChecked={r.isActive} isReadOnly mr={3} />
              <Text as="span" color="gray.600">
                {r.isActive ? "مفعل" : "غير مفعل"}
              </Text>
            </>
          );
        },
      },
      {
        key: "name",
        header: "اسم الصلاحية",
        width: "46%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color={titleClr}>
            {(row as Row).name}
          </Text>
        ),
      },
      {
        key: "type",
        header: "الدور",
        width: "20%",
        render: (row: AnyRec) => <Text color="gray.600">{(row as Row).type ?? roleCode}</Text>,
      },
    ],
    [titleClr, roleCode]
  );

  // ⇐ تعديل: افتح صفحة الميزات لنفس المجموعة بدور المكتب O
  const onEditRow = useCallback(
    (row: AnyRec) => {
      const r = row as Row;
      const id = r.id;
      if (!id) {
        toast({ title: "لا يمكن تحديد الصلاحية للتعديل", status: "warning" });
        return;
      }

      const to = `/officedashboard/group-right-features?groupId=${encodeURIComponent(
        String(id)
      )}&role=O`;

      navigate(to, { state: { row } });
    },
    [navigate, toast]
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
        <HStack />
        <HStack>
          <SharedButton variant="secondary" onClick={onRefresh}>
            تحديث
          </SharedButton>

          {/* إضافة صلاحية لدور المكتب */}
          <SharedButton
            variant="brandGradient"
            to="/officedashboard/privelgesOffice/add?role=O"
          >
            إضافة صلاحية
          </SharedButton>
        </HStack>
      </HStack>

      <DataTable
        title="صلاحيات مجموعات المكتب"
        data={pageRows as unknown as AnyRec[]}
        columns={columns}
        totalRows={totalRows}
        stickyHeader
        loading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEditRow={onEditRow}
      />

      {rows.length === 0 && <Text mt={3} color="gray.500">لا توجد بيانات لدور المكاتب.</Text>}
    </Box>
  );
}
