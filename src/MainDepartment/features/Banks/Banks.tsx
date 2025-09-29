// src/features/Banks/Banks.tsx
import React, { useState } from "react";
import {
  Box,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useBanksQuery } from "./hooks/useGetBanks";
import type { Column, AnyRec } from "../../../Components/Table/TableTypes";
import { DataTable } from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import { useAddBank } from "./hooks/useAddBank";

// استيراد المودال الجديد
import AddBankModal from "../AddBankModal";

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
    render: (row: AnyRec) =>
      row.BankCode ?? row.Bank_Code ?? row.SwiftCode ?? "-",
  },
];

export default function Banks() {
  const [page, setPage] = useState(1);
  const limit = 8;
  const offset = (page - 1) * limit;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, isError, error, isFetching } =
    useBanksQuery(offset, limit);

  const { isPending: isAdding } = useAddBank();

  const banksData = data?.rows || [];
  const totalRows = data?.totalRows || 0;

  const handleAddClick = () => {
    onOpen();
    console.log("تم النقر على إضافة بنك - فتح المودال");
  };

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
      {/* ✅ مودال إضافة بنك */}
      <AddBankModal isOpen={isOpen} onClose={onClose} />

      <DataTable
        title="قائمة البنوك"
        data={banksData}
        columns={BANKS_COLUMNS}
        startIndex={offset + 1}
        page={page}
        onPageChange={setPage}
        totalRows={totalRows}
        pageSize={limit}
        headerAction={
          <SharedButton
            variant="brandGradient"
            onClick={handleAddClick}
            leftIcon={<span>+</span>}
            isLoading={isFetching || isAdding}
          >
            إضافة بنك
          </SharedButton>
        }
      />

      <Flex justify="flex-end" mt={4} pr={4}>
        <Text fontSize="sm" color="gray.600">
          عرض {offset + 1}-{Math.min(offset + limit, totalRows)} من {totalRows}{" "}
          سجل
        </Text>
      </Flex>
    </Box>
  );
}
