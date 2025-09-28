import React, { useState } from "react";
import { Box, Switch, Text, Flex, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { DataTable } from "../../../Components/Table/DataTable";
import type { Column, AnyRec } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";
import { useCitiesQuery } from "./hooks/useCities";

// الأعمدة المطلوبة
const CITIES_COLUMNS: Column[] = [
  // الحقل الصحيح حسب الـ Console: CityName
  { key: "CityName", header: "اسم المدينة", width: "auto" },
  {
    key: "Status",
    header: "الحالة",
    width: "160px",
    render: (row: AnyRec) => {
      // دعم أكثر من تسمية للحالة إن وُجدت
      const isActive =
        row.Status === 1 ||
        row.IsActive === 1 ||
        row.Active === 1 ||
        row.IsBlocked === 0;

      const hasStatus =
        row.Status !== undefined ||
        row.IsActive !== undefined ||
        row.Active !== undefined ||
        row.IsBlocked !== undefined;

      return (
        <Flex align="center" gap="2" justify="flex-end">
          <Switch isChecked={!!isActive} size="sm" colorScheme="teal" isDisabled={!hasStatus} />
          <Text fontSize="sm" color={isActive ? "green.600" : "gray.600"}>
            {hasStatus ? (isActive ? "مفعل" : "غير مفعل") : "غير محدد"}
          </Text>
        </Flex>
      );
    },
  },
];

export default function Cities() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const offset = (page - 1) * limit;

  const { data, isLoading, isError, error, isFetching } = useCitiesQuery(offset, limit);

  const citiesData = data?.rows || [];
  const totalRows = data?.totalRows ?? 0;

  if (isLoading && !isFetching) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب المدن: {error.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <DataTable
        title="المدن"
        data={citiesData}
        columns={CITIES_COLUMNS}
        startIndex={offset + 1}
        headerAction={
          <SharedButton
            variant="brandGradient"
            onClick={() => console.log("إضافة مدينة")}
            leftIcon={<span>＋</span>}
            isLoading={isFetching}
          >
            إضافة مدينة
          </SharedButton>
        }
        page={page}
        onPageChange={(p: number) => setPage(p)}
        totalRows={totalRows}
        pageSize={limit}
      />

      {/* شريط الترقيم/الملخص */}
      <Flex justify="flex-end" mt={4} pr={4}>
        <Text fontSize="sm" color="gray.600">
          عرض {citiesData.length ? offset + 1 : 0}-{Math.min(offset + limit, totalRows)} من {totalRows} سجل
        </Text>
      </Flex>
    </Box>
  );
}
