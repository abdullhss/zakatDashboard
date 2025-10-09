import { useEffect, useMemo, useState } from "react";
import {
  Box, Text, HStack, VStack, FormControl, FormLabel, Input, Select, Switch,
  useToast, Checkbox, useColorModeValue, Badge, Spinner,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SharedButton from "../../../Components/SharedButton/Button";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";

import { useGetFeatures } from "./hooks/useGetFeaturesData";
import { useAddGroupRightWithFeatures } from "./hooks/useAddPrivelgeMulti";
import { getRoleFromStorage } from "../../../utils/auth";

type FeatureRow = {
  id: number | string;
  name: string;
  code?: string | number | null;
};

const PAGE_SIZE = 10;

export default function AddPrivelges() {
  const toast = useToast();
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const borderClr = useColorModeValue("background.border", "whiteAlpha.300");
  const panelBg = useColorModeValue("white", "gray.800");
  const titleClr = useColorModeValue("gray.700", "gray.100");

  // لو داخل بإضافة على مجموعة موجودة
  const groupRightId = sp.get("groupId") || "";

  // قراءة الدور المخزن + URL
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setRole(getRoleFromStorage());
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, []);
  const urlRole = sp.get("role");
  const effectiveRole = useMemo(
    () => (urlRole ?? role ?? "M").toUpperCase(),
    [urlRole, role]
  );

  // حقول إنشاء مجموعة جديدة (تتعطّل لو بنضيف على مجموعة موجودة)
  const [groupRightName, setGroupRightName] = useState<string>("");
  // RoleCode كسترينج "M" أو "O"
  const [groupRightType, setGroupRightType] = useState<string>("M");
  const [isActive, setIsActive] = useState<boolean>(true);

  // جلب الميزات حسب الدور
  const { data, isLoading, isError, error } = useGetFeatures(effectiveRole);

  // تطبيع البيانات
  const allRows: FeatureRow[] = useMemo(() => {
    const src = data?.rows ?? [];
    return src.map((r: AnyRec) => ({
      id:
        r.Id ?? r.FeatureId ?? r.Code ?? r.code ?? r.id ??
        Math.random().toString(36).slice(2),
      name: r.FeatureName ?? r.Name ?? r.name ?? "",
      code: r.Code ?? r.FeatureCode ?? r.code ?? null,
    }));
  }, [data?.rows]);

  // Pagination داخلي
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const pageRows = allRows.slice(offset, offset + PAGE_SIZE);
  const totalRows = allRows.length;

  // اختيار العناصر
  const [selected, setSelected] = useState<Record<string | number, boolean>>({});
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );
  const toggleOne = (id: string | number, v: boolean) =>
    setSelected((s) => ({ ...s, [id]: v }));

  const pageAllChecked =
    pageRows.length > 0 && pageRows.every((r) => selected[r.id]);
  const pageSomeChecked =
    !pageAllChecked && pageRows.some((r) => selected[r.id]);
  const togglePage = (value: boolean) => {
    setSelected((s) => {
      const next = { ...s };
      pageRows.forEach((r) => (next[r.id] = value));
      return next;
    });
  };

  // أعمدة الجدول
  const columns: Column[] = useMemo(
    () => [
      {
        key: "select",
        header: "اختيار",
        width: "20%",
        render: (row: AnyRec) => {
          const r = row as FeatureRow;
          const checked = !!selected[r.id];
          return (
            <Checkbox
              isChecked={checked}
              onChange={(e) => toggleOne(r.id, e.target.checked)}
            />
          );
        },
      },
      {
        key: "name",
        header: "اسم الميزة",
        width: "55%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color={titleClr}>
            {(row as FeatureRow).name}
          </Text>
        ),
      },
      {
        key: "code",
        header: "الكود",
        width: "25%",
        render: (row: AnyRec) => (
          <Text color="gray.600">{(row as FeatureRow).code ?? "—"}</Text>
        ),
      },
    ],
    [selected, titleClr]
  );

  // ميوتاشن
  const addMutation = useAddGroupRightWithFeatures();
  const isSubmitting = addMutation.isPending;

  const handleAdd = async () => {
    const featureIds = selectedIds;
    if (!featureIds.length) {
      toast({ status: "warning", title: "اختر عنصرًا واحدًا على الأقل." });
      return;
    }

    try {
      if (groupRightId) {
        console.log("[ADD] mode=append-details", { groupRightId, featureIds, isActive });
        await addMutation.mutateAsync({
          groupRightId,
          featureIds,
          isActive,
          pointId: 0,
        });
        // بعد الإضافة نرجع لقائمة الصلاحيات على الدور الحالي في الشاشة
        nav(`/maindashboard/privelges?role=${encodeURIComponent(effectiveRole)}`);
      } else {
        if (!groupRightName.trim()) {
          toast({
            status: "error",
            title: "اسم المجموعة مطلوب",
            description: "من فضلك أدخل اسم المجموعة قبل الإضافة.",
          });
          return;
        }
        console.log("[ADD] mode=create+details", {
          groupRightName, groupRightType, featureIds, isActive
        });
        await addMutation.mutateAsync({
          groupRightName: groupRightName.trim(),
          groupRightType, // "M" أو "O"
          featureIds,
          isActive,
          pointId: 0,
        });
        // بعد إنشاء مجموعة جديدة نفتح القائمة على نفس الدور اللي اتضاف
        nav(`/maindashboard/privelges?role=${encodeURIComponent(groupRightType)}`);
      }

      toast({
        status: "success",
        title: "تم إضافة الصلاحيات بنجاح",
        description: `عدد العناصر: ${featureIds.length}`,
      });
      setSelected({});
    } catch (e: any) {
      toast({
        status: "error",
        title: "تعذّر إضافة الصلاحيات",
        description: e?.message || "حدث خطأ غير متوقع.",
      });
    }
  };

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box dir="rtl">
      <VStack align="stretch" spacing={4} mb={4}>
        <Box bg={panelBg} border="1px solid" borderColor={borderClr} rounded="lg" p="16px">
          <HStack justify="space-between" flexWrap="wrap" gap={3} mb={3}>
            <Text fontWeight="800" fontSize="lg" color={titleClr}>
              لوحة التحكم
            </Text>
            <HStack gap={2}>
              {groupRightId && (
                <Badge colorScheme="teal" variant="subtle">
                  إضافة إلى مجموعة (ID: {groupRightId})
                </Badge>
              )}
            </HStack>
          </HStack>

          <HStack spacing={6} flexWrap="wrap" mb={4}>
            <FormControl w={{ base: "100%", md: "320px" }} isDisabled={!!groupRightId}>
              <FormLabel>اسم المجموعة</FormLabel>
              <Input
                placeholder="اكتب اسم المجموعة"
                value={groupRightName}
                onChange={(e) => setGroupRightName(e.target.value)}
              />
            </FormControl>

            <FormControl w={{ base: "100%", md: "220px" }} isDisabled={!!groupRightId}>
              <FormLabel>نوع المجموعة</FormLabel>
              <Select
                value={groupRightType}
                onChange={(e) => setGroupRightType(e.target.value)}
              >
                <option value="M">Main (M)</option>
                <option value="O">Office (O)</option>
              </Select>
            </FormControl>

            <FormControl w={{ base: "100%", md: "180px" }}>
              <FormLabel>حالة التفعيل</FormLabel>
              <HStack>
                <Switch
                  isChecked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <Text color="gray.600">{isActive ? "مفعل" : "غير مفعل"}</Text>
              </HStack>
            </FormControl>

            <SharedButton onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <HStack><Spinner size="sm" /><Text>جارِ الإضافة…</Text></HStack>
              ) : ("إضافة الصلاحيات المختارة")}
            </SharedButton>
          </HStack>
        </Box>
      </VStack>

      <Box bg={panelBg} border="1px solid" borderColor={borderClr} rounded="lg" p="16px">
        <DataTable
          title="الميزات (اختر لإضافتها كصلاحيات)"
          data={pageRows as unknown as AnyRec[]}
          columns={columns}
          startIndex={offset + 1}
          page={page}
          pageSize={PAGE_SIZE}
          totalRows={totalRows}
          onPageChange={setPage}
        />
        {totalRows === 0 && (
          <Text mt={3} color="gray.500">
            لا توجد ميزات لهذا الدور. تأكد من الدور أو جرّب تبديله عبر (?role=M).
          </Text>
        )}
      </Box>
    </Box>
  );
}
