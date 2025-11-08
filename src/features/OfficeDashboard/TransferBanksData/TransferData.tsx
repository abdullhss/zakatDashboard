import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import { HiPlus } from "react-icons/hi";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetTransferMoney } from "./hooks/useGetTransferMoney";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const TRANSFER_COLUMNS: Column[] = [
  {
    key: "Id",
    header: "#",
    width: "5%",
    render: (row: AnyRec) => row.Id ?? "—",
  },
  {
    key: "TransferDate",
    header: "تاريخ التحويل",
    width: "15%",
    render: (row: AnyRec) => {
      const dateStr = row.TransferDate;
      return dateStr
        ? new Date(dateStr).toLocaleDateString("en-GB") // 👈 English format
        : "—";
    },
  },
  {
    key: "From_AccountNum",
    header: "من حساب",
    width: "25%",
    render: (row: AnyRec) => (
      <Text>
        {row.FromBankName ? `${row.FromBankName} - ` : ""}
        <strong>{row.From_AccountNum}</strong>
      </Text>
    ),
  },
  {
    key: "To_AccountNum",
    header: "إلى حساب",
    width: "25%",
    render: (row: AnyRec) => (
      <Text>
        {row.ToBankName ? `${row.ToBankName} - ` : ""}
        <strong>{row.To_AccountNum}</strong>
      </Text>
    ),
  },
  {
    key: "TransferValue",
    header: "المبلغ",
    width: "15%",
    render: (row: AnyRec) => (
      <Text fontWeight="600" color="teal.600">
        {row.TransferValue} د.ل.
      </Text>
    ),
  },
  {
    key: "TransferByName",
    header: "المستخدم",
    width: "15%",
    render: (row: AnyRec) => row.TransferByName ?? "—",
  },
];

export default function TransferData() {
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, isFetching } = useGetTransferMoney(
    offset,
    limit
  );
  
  const rows = data?.rows ?? [];
  const totalRows = Number(data?.decrypted?.data.Result[0].TransferMoneysCount) || 1;

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
        حدث خطأ أثناء جلب بيانات التحويلات: {(error as Error)?.message}
      </Alert>
    );
  }

  return (
    <Box p={6} dir="rtl">
      <VStack align="stretch" spacing={6}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          سجلات تحويل الأموال
        </Heading>

        <DataTable
          title="قائمة التحويلات"
          data={rows as AnyRec[]}
          columns={TRANSFER_COLUMNS}
          startIndex={offset + 1}
          page={page}
          pageSize={limit}
          onPageChange={setPage}
          totalRows={totalRows}
          headerAction={
            <SharedButton
              variant="brandGradient"
              onClick={() => navigate("add")}
              leftIcon={<HiPlus />}
            >
              إضافة تحويل
            </SharedButton>
          }
        />

        {rows.length === 0 && !isLoading && (
          <Text mt={3} color="gray.500">
            لا توجد سجلات تحويل أموال حاليًا.
          </Text>
        )}
      </VStack>
    </Box>
  );
}
