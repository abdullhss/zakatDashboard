import  { useState } from "react";
import { Box, Spinner, Flex, Alert, AlertIcon } from "@chakra-ui/react";
import { useBanksQuery } from "./hooks/useGetBanks";
import { DataTable } from "../../../Components/Table/DataTable";
import type { Column, AnyRec } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";

// الأعمدة (لاحظ استخدام BankName و BankCode مع fallback)
const BANKS_COLUMNS: Column[] = [
  {
    key: "BankName",
    header: "اسم البنك",
    width: "auto",
    render: (row: AnyRec) => row.BankName ?? row.Bank_Name ?? "-",
  },
  {
    key: "BankCode",
    header: "الرمز المصرفي",
    width: "160px",
    render: (row: AnyRec) => row.BankCode ?? row.Bank_Code ?? row.SwiftCode ?? "-",
  },
];

export default function Banks() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const offset = (page - 1) * limit;

  const { data, isLoading, isError, error, isFetching } = useBanksQuery(offset, limit);

  const banksData = data?.rows || [];
  const totalRows = data?.totalRows || 0;

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
        حدث خطأ أثناء جلب البنوك: {error?.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <DataTable
        title="قائمة البنوك"
        data={banksData}
        columns={BANKS_COLUMNS}
        startIndex={offset + 1}
        page={page}
        onPageChange={(p: number) => setPage(p)}
        totalRows={totalRows}
        pageSize={limit}
        headerAction={
            <SharedButton
            variant="brandGradient"
            onClick={() => console.log("إضافة بنك")}
            leftIcon={<span>+</span>}
            isLoading={isFetching}
            
            >
إضافة بنك
            </SharedButton>
        }
        />
   

    </Box>
  );
}
