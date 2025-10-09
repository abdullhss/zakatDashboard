// src/features/MainDepartment/Privelges/PrivelgesTypes.tsx
import { Box, HStack, Select, Switch, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable"; // 👈 نفس الجدول المستخدم في باقي الشاشات
import SharedButton from "../../../Components/SharedButton/Button";

import type { AnyRec } from "../../../api/apiClient";
import { useGetPrivilege } from "./hooks/useGetPrivelge";

type Row = {
  id: string | number;
  name: string;
  isActive: boolean;
  code?: string | number | null;
  type?: string | null;
};

const PAGE_SIZE = 10;

export default function Privileges() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // الدور من الـ URL (افتراضي M)
  const spRole = (sp.get("role") || "M").toUpperCase() as "M" | "O";
  const [roleCode, setRoleCode] = useState<"M" | "O">(spRole);

  useEffect(() => {
    if (spRole !== roleCode) setRoleCode(spRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spRole]);

  // ترقيم
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  // جلب
  const { data, isLoading, isError, error, refetch } = useGetPrivilege(roleCode, offset, PAGE_SIZE);

  // تطبيع صفوف العرض
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
        `${Math.random()}`, // fallback
      name: r.GroupRight_Name ?? r.GroupRightName ?? r.RightName ?? r.Name ?? r.name ?? "",
      isActive: Boolean(r.IsActive ?? r.Active ?? r.isActive ?? true),
      code: r.Code ?? r.RightCode ?? r.code ?? null,
      type: r.GroupRightType ?? r.Type ?? roleCode,
    }));
  }, [data?.rows, roleCode]);

  const pageRows = rows.slice(0, PAGE_SIZE); // احتياطي
  const totalRows =
    typeof data?.totalRows === "number" ? data.totalRows : (data?.rows?.length ?? rows.length);

  const titleClr = useColorModeValue("gray.700", "gray.100");

  // أعمدة الجدول (من غير عمود إجراءات يدوي — الـ DataTable هيحط الأكشنز لو فيه onEditRow)
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

  // تعديل ⇒ يفتح صفحة التحديث بنفس شكل باقي الصفحات
  const onEditRow = useCallback(
    (row: AnyRec) => {
      const r = row as Row;
      const id = r.id;
      if (!id) {
        toast({ title: "لا يمكن تحديد الصلاحية للتعديل", status: "warning" });
        return;
      }
      const to = `/maindashboard/privelges/update?groupId=${encodeURIComponent(
        String(id)
      )}&featureType=${roleCode === "M" ? "1" : "2"}&role=${roleCode}`;
      navigate(to, { state: { row } });
    },
    [navigate, roleCode, toast]
  );

  // زر التحديث
  const onRefresh = useCallback(() => {
    refetch();
    toast({ title: "تم تحديث القائمة", status: "success", duration: 1200 });
  }, [refetch, toast]);

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box>
      {/* فلتر الدور + أزرار أعلى الجدول (زي باقي الشاشات) */}
      <HStack justify="space-between" mb={3}>
        <HStack>
          <Text mr={2}>الدور:</Text>
          <Select
            value={roleCode}
            onChange={(e) => {
              const v = e.target.value as "M" | "O";
              setPage(1);
              setRoleCode(v);
              setSp((prev) => {
                const p = new URLSearchParams(prev);
                p.set("role", v);
                return p;
              }, { replace: true });
            }}
            w="160px"
          >
            <option value="M">Main (M)</option>
            <option value="O">Office (O)</option>
          </Select>
        </HStack>

        <HStack>
          <SharedButton variant="secondary" onClick={onRefresh}>
            تحديث
          </SharedButton>
          <SharedButton variant="brandGradient" to={`/maindashboard/privelges/add?role=${roleCode}`}>
            إضافة
          </SharedButton>
        </HStack>
      </HStack>

      <DataTable
        title="صلاحيات المجموعات"
        data={pageRows as unknown as AnyRec[]}
        columns={columns}
        totalRows={totalRows}
        stickyHeader
        loading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEditRow={onEditRow}   // 👈 يخلي الجدول يظهر زر/منيو التعديل بنفس ستايل باقي الصفحات
        // مافيش onDeleteRow دلوقتي؛ أول ما تعمل هوك الحذف ضيفه هنا وهيظهر زر الحذف تلقائيًا
      />

      {rows.length === 0 && (
        <Text mt={3} color="gray.500">لا توجد بيانات لهذا الدور.</Text>
      )}
    </Box>
  );
}
