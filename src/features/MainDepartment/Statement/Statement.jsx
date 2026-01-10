import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  Heading,
  Spinner,
  Text,
  Flex,
  Alert,
  AlertIcon,
  Select,
  Input,
  HStack,
  Button,
} from "@chakra-ui/react";

import DataTable from "../../../Components/Table/DataTable";



import { useGetOfficePayment } from "../../../features/OfficeDashboard/StatementData/hooks/useGetDashBankStatmentData";
import { useGetDashBankData } from "../../MainDepartment/Offices/hooks/useGetDashBankData";

import { useGetOffices } from "../Offices/hooks/useGetOffices";


function formatDateToMMDDYYYY(date){
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

function getCurrentUserId(){
  try {
    const keys = ["mainUser", "MainUser", "user", "auth", "login"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const id = obj?.UserId ?? obj?.userId ?? obj?.Id ?? obj?.id;
      if (Number.isFinite(Number(id))) return Number(id);
    }
  } catch {}
  return 1;
}

export default function MainStatement() {

    const userId = getCurrentUserId();

  // المكتب المختار
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);

  // الحساب المختار
  const [selectedAccount, setSelectedAccount] = useState("");

  // التاريخ
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(getTodayDate());

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  // 🏢 جلب كل المكاتب
  const {
    data: officesData,
    isLoading: officesLoading,
    isError: officesError,
  } = useGetOffices(1 , 10000, 0);

  const offices = officesData?.rows ?? [];
  
  // 🏦 جلب الحسابات البنكية حسب المكتب
  const {
    data: bankData,
    isLoading: bankLoading,
    isError: bankError,
  } = useGetDashBankData(selectedOfficeId ?? 0, {
    enabled: !!selectedOfficeId, // ⬅️ شغّل الrequest فقط عند اختيار مكتب
  });

  const allAccounts = bankData?.rows ?? [];
  const officeAccounts = selectedOfficeId
    ? allAccounts.filter((acc) => Number(acc.officeId) === Number(selectedOfficeId))
    : [];

  // 📄 جلب كشف الحساب
  const params = useMemo(
    () => ({
      officeId: selectedOfficeId ?? 0,
      accountNum: selectedAccount,
      fromDate: formatDateToMMDDYYYY(fromDate),
      toDate: formatDateToMMDDYYYY(toDate),
    }),
    [selectedOfficeId, selectedAccount, fromDate, toDate]
  );

  const {
    data: statementData,
    isLoading: statementLoading,
    isError: statementError,
    error,
  } = useGetOfficePayment(params, offset, limit);


  const rows = statementData?.rows ?? [];

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 📌 Table Columns
  const PAYMENTS_COLUMNS = [
    {
      key: "PaymentDate",
      header: "التاريخ",
      render: (row) => {
        const dateStr = row.PaymentDate;
        return dateStr
          ? new Date(dateStr).toLocaleDateString("en-GB")
          : "—";
      },
    },
    { key: "UserName", header: "المستخدم" },
    { key: "SubventionTypeName", header: "النوع" },
    { key: "PaymentDesc", header: "الوصف" },
    {
      key: "DebitValue",
      header: "القبض",
      render: (row) => (
        <Text fontWeight="600" color="green.600">
          {row.DebitValue ?? 0}
        </Text>
      ),
    },
    {
      key: "CreditValue",
      header: "الصرف",
      render: (row) => (
        <Text fontWeight="600" color="red.600">
          {row.CreditValue ?? 0}
        </Text>
      ),
    },
    {
      key: "NetValue",
      header: "الصافي",
      render: (row) => {
        const net = (row.DebitValue ?? 0) - (row.CreditValue ?? 0);
        return (
          <Text fontWeight="bold" color={net >= 0 ? "green.700" : "red.700"}>
            {net}
          </Text>
        );
      },
    },
  ];

  return (
    <Box p={6} dir="rtl">
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">كشف حساب المكتب</Heading>

        {/* 🏢 اختيار المكتب */}
        <Box>
          <Text mb={2} fontWeight="600">اختر المكتب:</Text>
          <Select
            placeholder="اختر المكتب"
            value={selectedOfficeId ?? ""}
            padding={3}
            onChange={(e) => {
              setSelectedOfficeId(Number(e.target.value));
              setSelectedAccount("");
            }}
          >
            {offices.map((office) => (
              <option key={office.Id} value={office.Id}>
                {office.OfficeName}
              </option>
            ))}
          </Select>
        </Box>

        {/* 🏦 اختيار الحساب */}
        {selectedOfficeId && (
          <Box>
            <Text mb={2} fontWeight="600">اختر رقم الحساب البنكي:</Text>
            {bankLoading ? (
              <Spinner />
            ) : (
              <Select
                placeholder="اختر الحساب"
                padding={3}
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {officeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.accountNumber}>
                    {acc.accountNumber} — {acc.bankName}
                  </option>
                ))}
              </Select>
            )}
          </Box>
        )}

        {/* 🗓️ فلاتر التاريخ */}
        <HStack spacing={4}>
          <Box flex="1">
            <Text mb={1}>من تاريخ:</Text>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </Box>
          <Box flex="1">
            <Text mb={1}>إلى تاريخ:</Text>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </Box>
        </HStack>

        {/* 📄 جدول كشف الحساب */}
        {selectedOfficeId && selectedAccount ? (
          statementLoading ? (
            <Flex justify="center"><Spinner size="lg" /></Flex>
          ) : rows.length > 0 ? (
            <>
              <div id="printable-table">
                <DataTable
                  columns={PAYMENTS_COLUMNS}
                  data={rows}
                  page={page}
                  pageSize={limit}
                  onPageChange={setPage}
                  totalRows={
                    Number(statementData?.decrypted?.data?.Result?.[0]?.OfficePaymentsCount) || 1
                  }
                />
              </div>

                <Button colorScheme="blue" onClick={() => window.print()}>
                  طباعة
                </Button>
            </>
          ) : (
            <Text textAlign="center" color="gray.500">لا توجد بيانات.</Text>
          )
        ) : (
          <Text textAlign="center" color="gray.500">
            اختر مكتب ثم حساب بنكي لعرض كشف الحساب.
          </Text>
        )}
      </VStack>
    </Box>
  );
}
