import { useEffect, useMemo, useState } from "react";
import {
  Box, Text, HStack, VStack, FormControl, FormLabel, Input,
  useToast, useColorModeValue, Spinner
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import SharedButton from "../../../Components/SharedButton/Button";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";

import { useGetFeatures } from "./hooks/useGetFeaturesData";
import { useAddGroupRightWithFeatures } from "./hooks/useAddPrivelgeMulti";
import { getSession } from "../../../session";

type FeatureRow = { id: number | string; name: string; code?: string | number | null };
const PAGE_SIZE = 10;

export default function AddPrivelges() {
  const toast = useToast();
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const borderClr = useColorModeValue("background.border", "whiteAlpha.300");
  const panelBg   = useColorModeValue("white", "gray.800");
  const titleClr  = useColorModeValue("gray.700", "gray.100");

  // session
  const { role, officeName } = getSession(); // role = "M" | "O"

  const groupRightId = sp.get("groupId") || "";

  const [selectAll, setSelectAll] = useState(false);

  const [groupRightName, setGroupRightName] = useState<string>("");
const lockName = false;
  useEffect(() => {
    if (lockName) setGroupRightName(officeName || "");
  }, [lockName, officeName]);

  // جلب الميزات حسب دور المستخدم الحالي فقط
  const { data, isLoading, isError, error } = useGetFeatures(role);

  const allRows: FeatureRow[] = useMemo(() => {
    const src = data?.rows ?? [];
    return src.map((r: AnyRec) => ({
      id:   r.Id ?? r.FeatureId ?? r.Code ?? r.code ?? r.id ?? Math.random().toString(36).slice(2),
      name: r.FeatureName ?? r.Name ?? r.name ?? "",
      code: r.Code ?? r.FeatureCode ?? r.code ?? null,
    }));
  }, [data?.rows]);

  // Pagination
  const [page, setPage] = useState(1);
  const offset   = (page - 1) * PAGE_SIZE;
  const pageRows = allRows.slice(offset, offset + PAGE_SIZE);
  const totalRows = allRows.length;

  // selection
  const [selected, setSelected] = useState<Record<string | number, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const toggleOne = (id: string | number, v: boolean) => setSelected((s) => ({ ...s, [id]: v }));
  const pageAllChecked  = pageRows.length > 0 && pageRows.every((r) => selected[r.id]);
  const pageSomeChecked = !pageAllChecked && pageRows.some((r) => selected[r.id]);
  const toggleAll = (value: boolean) => {
    setSelectAll(value);
    setSelected(() => {
      if (!value) return {};
      const all: Record<string | number, boolean> = {};
      allRows.forEach((r) => {
        all[r.id] = true;
      });
      return all;
    });
  };
  const allChecked = allRows.length > 0 && allRows.every((r) => selected[r.id]);
  const someChecked = !allChecked && allRows.some((r) => selected[r.id]);

  // columns
  const columns: Column[] = useMemo(
    () => [
      {
        key: "select",
        header: (
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => el && (el.indeterminate = someChecked)}
            onChange={(e) => toggleAll(e.target.checked)}
          />
        ) as unknown as string,
        width: "16%",
        render: (row: AnyRec) => {
          const r = row as FeatureRow;
          return (
            <input
              type="checkbox"
              checked={!!selected[r.id]}
              onChange={(e) => toggleOne(r.id, e.target.checked)}
            />
          );
        },
      },

      {
        key: "name",
        header: "اسم الميزة",
        // width: "56%",
        render: (row: AnyRec) => <Text fontWeight="600" color={titleClr}>{(row as FeatureRow).name}</Text>,
      },
    ],
    [selected, titleClr, pageAllChecked, pageSomeChecked]
  );

  // mutation
  const addMutation   = useAddGroupRightWithFeatures();
  const isSubmitting  = addMutation.isPending;



  
  const handleAdd = async () => {
    const featureIds = selectedIds;
    if (!featureIds.length) {
      toast({ status: "warning", title: "اختر عنصرًا واحدًا على الأقل." });
      return;
    }

    try {
      if (groupRightId) {
        // إضافة تفاصيل لمجموعة موجودة
        await addMutation.mutateAsync({
          groupRightId,
          featureIds,
          pointId: 0,
        });
        nav("/officedashboard/privelgesOffice"); // أو قائمة الإدارة لو انت M
      } else {
        // إنشاء مجموعة + تفاصيل — الدور = دور المستخدم الحالي، التفعيل دائمًا true
        if (!lockName && !groupRightName.trim()) {
          toast({ status: "error", title: "اسم المجموعة مطلوب" });
          return;
        }
        const response = await addMutation.mutateAsync({
          groupRightName: (lockName ? (officeName || "") : groupRightName.trim()),
          groupRightType: role,   // "M" أو "O" من الـ session
          featureIds,
          allFeatures: data.rows,
          pointId: 0,
        });
          if(response.code ==207){
            toast({ status: "error", title: "يوجد صلاحية بنفس الاسم", });
          }
          else{
            toast({ status: "success", title: "تم إضافة الصلاحيات بنجاح", description: `عدد العناصر: ${featureIds.length}` });
            nav(role === "O" ? "/officedashboard/privelgesOffice" : "/maindashboard/privelges");
          }
          // console.log(data.rows);
          // console.log(featureIds);
        // رجّع لقائمة الصلاحيات المناسبة
      }

      setSelected({});
    } catch (e: any) {
      toast({ status: "error", title: "تعذّر إضافة الصلاحيات", description: e?.message || "حدث خطأ غير متوقع." });
    }
  };

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError)   return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box dir="rtl">
      <VStack align="stretch" spacing={4} mb={4}>
        <Box bg={panelBg} border="1px solid" borderColor={borderClr} rounded="lg" p="16px">
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="800" fontSize="lg" color={titleClr}>لوحة التحكم</Text>
          </HStack>

          <HStack spacing={6} flexWrap="wrap" justifyItems={"end"}>
            <FormControl w={{ base: "100%", md: "360px" }}>
              <FormLabel>اسم المجموعة</FormLabel>
              <Input
                placeholder={lockName ? "" : "اكتب اسم المجموعة"}
                value={groupRightName}
                onChange={(e) => setGroupRightName(e.target.value)}
                isDisabled={lockName}
              />
            </FormControl>

            <SharedButton mt={10} onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (<HStack><Spinner size="sm" /><Text>جارِ الإضافة…</Text></HStack>) : ("إضافة الصلاحيات المختارة")}
            </SharedButton>
          </HStack>
        </Box>
      </VStack>

      <Box bg={panelBg} border="1px solid" borderColor={borderClr} rounded="lg" p="16px">
        <DataTable
          title={`الميزات (${role === "O" ? "مكاتب" : "إدارة"})`}
          data={pageRows as unknown as AnyRec[]}
          columns={columns}
          startIndex={offset + 1}
          page={page}
          pageSize={PAGE_SIZE}
          totalRows={totalRows}
          onPageChange={setPage}
        />
        {totalRows === 0 && (
          <Text mt={3} color="gray.500">لا توجد ميزات متاحة لهذا الدور.</Text>
        )}
      </Box>
    </Box>
  );
}
