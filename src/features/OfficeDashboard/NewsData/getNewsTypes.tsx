import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Flex, Spinner, Alert, AlertIcon, Text,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetTypesNewsData } from "./hooks/useGetTypesNewsData";

const PAGE_SIZE = 10;

export default function NewsTypesPage() {
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const { data, isLoading, isError, error } = useGetTypesNewsData(offset, limit);

  // نحاول استخدام rows الجاهزة من الهوك، وإلا نفكّ الخام (NewsTypesData / NewsTypesData_1)
  const { rows, totalRows } = useMemo(() => {
    // 1) الشكل الموحّد من الهوك
    const unifiedRows: AnyRec[] = (data as any)?.rows || [];
    const unifiedTotal = Number((data as any)?.totalRows ?? unifiedRows.length) || 0;

    if (unifiedRows.length > 0) {
      return { rows: unifiedRows, totalRows: unifiedTotal };
    }

    // 2) fallback: فكّ الحمولة الخام
    const payload: any = data ?? {};
    const root = payload?.data ?? payload;
    const bucket = root?.Result?.[0] ?? {};

    const strA: string | undefined = bucket?.NewsTypesData;
    const strB: string | undefined = bucket?.NewsTypesData_1;

    let parsed: AnyRec[] = [];
    try { if (strA) parsed = JSON.parse(strA); } catch {}
    if (parsed.length === 0) { try { if (strB) parsed = JSON.parse(strB); } catch {} }

    const total = Number(root?.TotalRowsCount ?? parsed.length) || parsed.length;
    return { rows: parsed, totalRows: total };
  }, [data]);

  // للمتابعة في الكونسول
  const [params] = useSearchParams();
  const selectedTypeId = params.get("typeId");
  useEffect(() => {
    console.groupCollapsed("%c[NewsTypes] payload", "color:#6b7280;font-weight:bold");
    console.log("rows:", rows);
    console.log("totalRows:", totalRows);
    console.log("selectedTypeId:", selectedTypeId);
    console.groupEnd();
  }, [rows, totalRows, selectedTypeId]);

  // أعمدة بسيطة: رقم + اسم النوع فقط (من غير ألوان/Badge/سويتش)
  const columns: Column[] = useMemo(
    () => [
     
      {
        key: "NewsTypeName",
        header: "اسم النوع",
        width: "90%",
        render: (row: AnyRec) => (
          <Text color="gray.800">
            {row?.NewsTypeName ?? row?.TypeName ?? "—"}
          </Text>
        ),
      },
    ],
    [offset]
  );

  if (isLoading) {
    return (
      <Flex justify="center" p={10}><Spinner size="xl" /></Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        فشل تحميل أنواع الأخبار: {(error as Error)?.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <Text fontSize="xl" fontWeight="800" mb={4}>أنواع الأخبار</Text>
      <DataTable
        title=""
        data={rows as AnyRec[]}
        columns={columns}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        totalRows={totalRows}
      />
      {rows.length === 0 && (
        <Text mt={3} color="gray.500">لا توجد أنواع متاحة.</Text>
      )}
    </Box>
  );
}
