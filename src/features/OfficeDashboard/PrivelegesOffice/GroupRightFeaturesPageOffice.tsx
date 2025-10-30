// src/features/OfficeDashboard/GroupRightFeaturesPage.tsx
import React, { useMemo, useCallback } from "react";
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Switch,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import DataTable from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";

// ✅ استخدم هوكات نسخة المكتب (O)
import { useGetGroupRightFeature } from "../../MainDepartment/Privelges/hooks/useGetGroupRightFeature";
import { useGetFeatures } from "../../MainDepartment/Privelges/hooks/useGetFeaturesData";
import { useUpdateGroupRightFeatureValue } from "../../MainDepartment/Privelges/hooks/useUpdateGroupRightFeatures";

type FeatureRow = AnyRec & {
  FeatureName: string;
  FeatureCode?: string | null;
  GroupRightValue: number | string; // 1/0
  DetailId?: number | string | null; // Id لسطر GroupRight_D
};

export default function GroupRightFeaturesPage() {
  const toast = useToast();

  // ✅ القراءة الصحيحة للـ query params
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  // ✅ افتراضي مكتب
  const groupRightId = Number(query.get("groupId")) || 0;
  const roleCode = (query.get("role") || "O").toUpperCase(); // "O" | "M" ...

  // حراسة اختيارية لو الـ id غير صحيح
  if (!groupRightId) {
    return (
      <Alert status="warning" m={6}>
        <AlertIcon />
        معرّف المجموعة غير صالح. افتح الصفحة من شاشة “صلاحيات مجموعات المكتب”.
      </Alert>
    );
  }

  // 1) بيانات صلاحيات هذه المجموعة
  const groupQuery = useGetGroupRightFeature(roleCode, groupRightId);
  const groupRows = groupQuery.data?.rows ?? [];
  const groupTotalRows = groupQuery.data?.totalRows ?? groupRows.length;

  // 2) الميزات العامة (لبناء فهرس اسم/كود → Id)
  const generalQuery = useGetFeatures(roleCode as any);
  const generalRows = generalQuery.data?.rows ?? [];

  const featuresIndexByName = useMemo(() => {
    const map = new Map<string, number | string>();
    for (const f of generalRows) {
      const name = (f.FeatureName ?? f.Name ?? "").trim();
      if (name) map.set(name, f.Id ?? f.Feature_Id ?? f.Code ?? f.FeatureCode);
      // إن وُجد كود، نضيفه أيضاً
      const code = (f.FeatureCode ?? f.Code ?? "").toString().trim();
      if (code) map.set(code, f.Id ?? f.Feature_Id ?? code);
    }
    return map;
  }, [generalRows]);

  // 3) الميوتشن (تحديث القيمة)
  const updateMutation = useUpdateGroupRightFeatureValue(groupQuery.refetch);

  // 4) عند تغيير الحالة (Switch)
  const handleValueChange = useCallback(
    (row: FeatureRow, isChecked: boolean) => {
      if (groupRightId <= 0) {
        toast({ title: "معرّف المجموعة غير صالح", status: "error" });
        return;
      }

      // نحاول نجيب featureId بالاسم ثم بالكود
      const nameKey = (row.FeatureName ?? "").trim();
      const codeKey = (row.FeatureCode ?? "").toString().trim();

      const featureId =
        featuresIndexByName.get(nameKey) ??
        (codeKey ? featuresIndexByName.get(codeKey) : undefined);

      if (!featureId) {
        toast({
          title: "تعذر تحديد الـ Feature",
          description: `لا يوجد معرف لميزة: ${row.FeatureName}`,
          status: "error",
        });
        return;
      }

      const detailId = row.DetailId ?? row.Id ?? null;

      updateMutation.mutate({
        groupRightId,
        featureId,
        isActive: isChecked,
        detailId, // لو موجود → Update، لو null → Insert
      });
    },
    [featuresIndexByName, groupRightId, toast, updateMutation]
  );

  const COLUMNS: Column[] = useMemo(
    () => [
      {
        key: "FeatureName",
        header: "اسم الميزة",
        width: "40%",
        render: (r: AnyRec) => (r as FeatureRow).FeatureName ?? "—",
      },
      {
        key: "GroupRightValue",
        header: "القيمة (تفعيل)",
        width: "40%",
        render: (r: AnyRec) => {
          const row = r as FeatureRow;
          const isChecked = Number(row.GroupRightValue) === 1;
          return (
            <Switch
              isChecked={isChecked}
              onChange={(e) => handleValueChange(row, e.target.checked)}
              isDisabled={updateMutation.isPending}
              colorScheme="green"
            />
          );
        },
      },
    ],
    [handleValueChange, updateMutation.isPending]
  );

  if (groupQuery.isLoading || generalQuery.isLoading || updateMutation.isPending) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (groupQuery.isError || generalQuery.isError) {
    const err =
      (groupQuery.error as any)?.message ||
      (generalQuery.error as any)?.message ||
      "خطأ غير معروف.";
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ في جلب البيانات: {err}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <DataTable
        title={`صلاحيات الميزات للمجموعة رقم: ${groupRightId} (النوع: ${roleCode})`}
        data={groupRows as unknown as AnyRec[]}
        columns={COLUMNS as any}
        totalRows={groupTotalRows}
        stickyHeader
        page={1}
        pageSize={groupTotalRows}
        startIndex={1}
      />
      {groupRows.length === 0 && (
        <Text mt={3} color="gray.500">
          لا توجد ميزات مُسجلة لهذه المجموعة.
        </Text>
      )}

      <Divider my={10} />
    </Box>
  );
}
