import { useMemo, useState } from "react";
import {
  Box,
  Text,
  useColorModeValue,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";

import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetFeaturesByGroup } from "./hooks/useGetFeatureByGroup";

type Row = {
  id: number | string;
  name: string;
  code?: string | number | null;
  isActive?: boolean; // لو الـ SP بيرجع حالة الربط
};

const PAGE_SIZE = 10;

export default function UpdatePrivileges() {
  const [sp] = useSearchParams();
  const featureType = sp.get("featureType") ?? "1";
  const groupRightId = sp.get("groupId") ?? "";

  const panelBg = useColorModeValue("white", "gray.800");
  const borderClr = useColorModeValue("background.border", "whiteAlpha.300");
  const titleClr = useColorModeValue("gray.700", "gray.100");

  const { data, isLoading, isError, error } = useGetFeaturesByGroup(
    featureType,
    groupRightId
  );

  // تطبيع النتائج
  const rows: Row[] = useMemo(() => {
    const src = data?.rows ?? [];
    return src.map((r: AnyRec) => ({
      id:
        r.Id ??
        r.FeatureId ??
        r.Code ??
        r.id ??
        Math.random().toString(36).slice(2),
      name: r.FeatureName ?? r.Name ?? r.name ?? "",
      code: r.Code ?? r.FeatureCode ?? r.code ?? null,
      isActive: r.IsActive ?? r.Active ?? r.isActive,
    }));
  }, [data?.rows]);

  const totalRows = rows.length;
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const pageData = rows.slice(offset, offset + PAGE_SIZE);

  const columns: Column[] = useMemo(
    () => [
      {
        key: "name",
        header: "اسم الميزة",
        width: "60%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color={titleClr}>
            {(row as Row).name}
          </Text>
        ),
      },
      {
        key: "code",
        header: "الكود",
        width: "20%",
        render: (row: AnyRec) => (
          <Text color="gray.600">{(row as Row).code ?? "—"}</Text>
        ),
      },
      {
        key: "isActive",
        header: "حالة الربط",
        width: "20%",
        render: (row: AnyRec) => {
          const v = (row as Row).isActive;
          return (
            <Badge colorScheme={v ? "green" : "gray"}>
              {v ? "مرتبط" : "غير مرتبط"}
            </Badge>
          );
        },
      },
    ],
    [titleClr]
  );

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError)
    return (
      <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>
    );

  return (
    <Box dir="rtl">
      <Box
        bg={panelBg}
        border="1px solid"
        borderColor={borderClr}
        rounded="lg"
        p="16px"
      >
        <HStack justify="space-between" mb="12px" wrap="wrap" gap={3}>
          <Text fontWeight="800" fontSize="lg" color={titleClr}>
            تحديث صلاحيات المجموعة
          </Text>
          <HStack>
            <Badge colorScheme="teal" variant="subtle">
              نوع الميزة: {featureType}
            </Badge>
            <Badge colorScheme="purple" variant="subtle">
              المجموعة: {groupRightId || "غير محددة"}
            </Badge>
          </HStack>
        </HStack>

        <DataTable
          title="الميزات المرتبطة/المتاحة"
          data={pageData as unknown as AnyRec[]}
          columns={columns}
          startIndex={offset + 1}
          page={page}
          pageSize={PAGE_SIZE}
          totalRows={totalRows}
          onPageChange={setPage}
        />
      </Box>
    </Box>
  );
}
