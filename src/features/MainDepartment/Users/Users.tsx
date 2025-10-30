// src/features/MainDepartment/Users/Users.tsx
import { useMemo, useState, useCallback } from "react";
import { Box, HStack, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";

import type { AnyRec } from "../../../api/apiClient";
import { useGetUsers } from "./hooks/useGetUser";
import { useDeleteUser } from "./hooks/useDeleteUser";

/** بناء WHERE للبحث */
function buildSearchSQL(q: string) {
  const s = q.trim();
  if (!s) return "";
  const safe = s.replace(/'/g, "''");
  return `WHERE (UserName LIKE '%${safe}%' OR Mobile LIKE '%${safe}%' OR Email LIKE '%${safe}%')`;
}

/** ترتيب افتراضي */
const DEFAULT_ORDER = "ORDER BY UserId DESC";

/** عرض نوع الحساب */
const asAccountType = (v: any) => {
  const code = String(v ?? "").trim().toUpperCase();
  if (code === "M") return "إدارة";
  if (code === "O") return "مكتب";
  return "—";
};

export default function Users() {
  const toast = useToast();
  const navigate = useNavigate();

  // ترقيم
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // بحث (لو عندك حقل UI للبحث اربطه بهذه الحالة)
  const [query, setQuery] = useState<string>("");

  // حساب StartNum و Count (1-based)
  const startNum = useMemo(() => {
    const p = Number.isFinite(page) ? Math.trunc(page) : 1;
    const sz = Number.isFinite(pageSize) ? Math.trunc(pageSize) : 25;
    return Math.max(1, (Math.max(1, p) - 1) * Math.max(1, sz) + 1);
  }, [page, pageSize]);

  const count = useMemo(() => {
    const sz = Number.isFinite(pageSize) ? Math.trunc(pageSize) : 25;
    return Math.max(1, sz);
  }, [pageSize]);
  const encSQLRaw = useMemo(() => {
    const where = buildSearchSQL(query);
    return [where, DEFAULT_ORDER].filter(Boolean).join(" ").trim();
  }, [query]);

  // جلب البيانات
  const { loading, error, rows, total, refetch } = useGetUsers({
    startNum,
    count,
    encSQLRaw,
    auto: true,
  });

  // حذف
  const { loading: deleting, submit: deleteSubmit } = useDeleteUser();

  // أعمدة الجدول
  const columns = useMemo(
    () => [
      {
        key: "UserName",
        header: "الاسم",
        width: "260px",
        render: (r: AnyRec) => r.UserName ?? r.Name ?? r.name ?? "—",
      },
      {
        key: "Email",
        header: "البريد الإلكتروني",
        width: "280px",
        render: (r: AnyRec) => r.Email ?? r.email ?? "—",
      },
      {
        key: "PhoneNum",
        header: "رقم الهاتف",
        width: "200px",
        render: (r: AnyRec) =>
          r.PhoneNum ?? r.Mobile ?? r.Phone ?? r.phone ?? "—",
      },
      {
        key: "UserType",
        header: "نوع الحساب",
        width: "160px",
        render: (r: AnyRec) => asAccountType(r.UserType),
      },
    ],
    []
  );

  // تغيير الصفحة
  const onPageChange = useCallback((next: number) => {
    const nextSafe = Math.max(1, Number.isFinite(next) ? Math.trunc(next) : 1);
    setPage(nextSafe);
  }, []);

  // تحرير ⇒ يفتح صفحة التعديل ويبعث الـ row
  const onEditRow = useCallback(
    (row: AnyRec) => {
      const id = row.Id ?? row.UserId ?? row.id ?? row.userId;
      if (!id) {
        toast({ title: "لا يمكن تحديد المستخدم للتعديل", status: "warning" });
        return;
      }
      navigate(`/maindashboard/users/edit/${id}`, { state: { row } });
    },
    [navigate, toast]
  );

  // حذف فعلي
  const onDeleteRow = useCallback(
    async (row: AnyRec) => {
      try {
        const ok = window.confirm("هل أنت متأكد من حذف هذا المستخدم؟");
        if (!ok) return;

        await deleteSubmit({
          Id: row.Id ?? row.id ?? row.UserId ?? row.userId,
          UserName: row.UserName ?? row.Name ?? row.name ?? "",
          Email: row.Email ?? row.email ?? "",
          PhoneNum: row.PhoneNum ?? row.Mobile ?? row.Phone ?? row.phone ?? "",
          LoginName:
            row.LoginName ?? row.UserName ?? row.Name ?? row.name ?? "",
          Password: "", // لا نُغيّر كلمة المرور هنا
          GroupRight_Id: row.GroupRight_Id ?? 0,
          UserType: row.UserType ?? "",
          Office_Id: row.Office_Id ?? row.OfficeId ?? 0,
        });

        toast({ title: "تم حذف المستخدم", status: "success" });
        refetch(); // لإعادة تحميل القائمة بعد الحذف
      } catch (e: any) {
        toast({ title: e?.message || "تعذّر الحذف", status: "error" });
      }
    },
    [deleteSubmit, refetch, toast]
  );

  return (
    <Box>
      <DataTable
        title="قائمة المستخدمين"
        data={rows}
        columns={columns}
        totalRows={total ?? rows.length}
        stickyHeader
        loading={loading || deleting}
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        headerAction={
          <HStack spacing={3}>
            <SharedButton
              variant="brandGradient"
              to="/maindashboard/users/add"
              leftIcon={
                <Box
                  bg="white"
                  color="brand.900"
                  w="22px"
                  h="22px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="700"
                  lineHeight="1"
                  fontSize="18px"
                  rounded="sm"
                >
                  ＋
                </Box>
              }
            >
              إضافة مستخدم
            </SharedButton>
          </HStack>
        }
      />

      {/* أخطاء */}
      {error ? (
        <Box mt={3} color="red.500" fontSize="sm">
          {error}
        </Box>
      ) : null}
    </Box>
  );
}
