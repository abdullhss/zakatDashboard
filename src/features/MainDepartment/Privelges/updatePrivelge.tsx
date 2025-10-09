// src/features/MainDepartment/Privelges/updatePrivelgesPage.tsx
import { useMemo, useState, useCallback } from "react";
import {
  Box,
  HStack,
  Text,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import type { AnyRec } from "../../../api/apiClient";

import { useGroupRightFeatures } from "./hooks/useGetGroupRightFeatures";
import { updateGroupRightFeatures } from "./hooks/updateGroupRightFeatures";

type Row = {
  Feature_Id: number | string;
  FeatureName: string;
  IsActive: number | boolean;
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function UpdatePrivileges() {
  const q = useQuery();
  const nav = useNavigate();
  const toast = useToast();

  const groupId = q.get("groupId") || "";
  // 1 => M  ,  2 => O  (حسب نظامك)
  const featureType = q.get("featureType") || "1";

  const { data, isLoading, isError, error, refetch } = useGroupRightFeatures(
    featureType,
    groupId,
    0,
    500
  );

  // طبّع البيانات لصفوف العرض
  const initialRows: Row[] = useMemo(() => {
    const src = (data?.rows ?? []) as AnyRec[];
    return src.map((r) => ({
      Feature_Id:
        r.Feature_Id ?? r.FeatureId ?? r.Id ?? r.id ?? r.Code ?? crypto.randomUUID(),
      FeatureName: r.FeatureName ?? r.Name ?? r.name ?? "",
      IsActive: Number(r.IsActive ?? r.isActive ?? 1) === 1,
    }));
  }, [data?.rows]);

  const [localRows, setLocalRows] = useState<Row[]>(initialRows);
  // لما الداتا تتحدّث من السيرفر، نزبط النسخة المحلية
  // (لو حابب، تقدر تستخدم useEffect لمزامنة localRows مع initialRows)
  if (localRows.length === 0 && initialRows.length > 0) {
    // first mount
    setLocalRows(initialRows);
  }

  const columns = useMemo(
    () => [
      {
        key: "FeatureName",
        header: "الميزة",
        width: "70%",
        render: (row: AnyRec) => <Text fontWeight="600">{(row as Row).FeatureName}</Text>,
      },
      {
        key: "IsActive",
        header: "الحالة",
        width: "30%",
        render: (row: AnyRec) => {
          const r = row as Row;
          const checked = Boolean(r.IsActive);
          return (
            <HStack>
              <Switch
                isChecked={checked}
                onChange={(e) => {
                  const v = e.target.checked;
                  setLocalRows((prev) =>
                    prev.map((it) =>
                      it.Feature_Id === r.Feature_Id ? { ...it, IsActive: v } : it
                    )
                  );
                }}
              />
              <Text color="gray.600">{checked ? "مفعلة" : "مُلغاة"}</Text>
            </HStack>
          );
        },
      },
    ],
    []
  );

  const onSave = useCallback(async () => {
    try {
      const entries = localRows.map((r) => ({
        featureId: r.Feature_Id,
        isActive: Boolean(r.IsActive),
      }));
      await updateGroupRightFeatures(groupId, entries);
      toast({ title: "تم حفظ التغييرات", status: "success" });
      refetch();
    } catch (e: any) {
      toast({ title: e?.message || "تعذّر الحفظ", status: "error" });
    }
  }, [groupId, localRows, refetch, toast]);

  const onCancel = useCallback(() => {
    nav(-1);
  }, [nav]);

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="700">تحديث صلاحيات المجموعة</Text>
        <HStack>
          <SharedButton variant="secondary" onClick={() => refetch()}>
            تحديث
          </SharedButton>
          <SharedButton variant="dangerOutline" onClick={onCancel}>
            إلغاء
          </SharedButton>
          <SharedButton variant="brandGradient" onClick={onSave}>
            حفظ
          </SharedButton>
        </HStack>
      </HStack>

      {isLoading ? (
        <Text color="gray.600">جارِ التحميل…</Text>
      ) : isError ? (
        <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>
      ) : (
        <DataTable
          title="ميزات المجموعة"
          data={localRows as unknown as AnyRec[]}
          columns={columns}
          totalRows={localRows.length}
          stickyHeader
          page={1}
          pageSize={localRows.length || 10}
          onPageChange={() => {}}
          // لا نحتاج onEditRow/onDeleteRow هنا — الهدف عرض سويتش فقط
        />
      )}
    </Box>
  );
}
