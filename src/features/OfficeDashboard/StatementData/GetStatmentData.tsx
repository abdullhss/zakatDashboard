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
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { useGetOfficePayment } from "./hooks/useGetDashBankStatmentData";
import { useGetDashBankData } from "../../MainDepartment/Offices/hooks/useGetDashBankData";
import { getSession } from "../../../session";

function formatDateToMMDDYYYY(date: string | Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

// ✅ طباعة كشف الحساب بشكل رسمي يحتوي على اسم المكتب + الفترة + الإجماليات
function printAllOperations(rows: any[], officeName: string, fromDate: string, toDate: string) {
  if (!rows.length) {
    alert("لا توجد بيانات للطباعة.");
    return;
  }

  const totalDebit = rows.reduce((sum, r) => sum + (Number(r.DebitValue) || 0), 0);
  const totalCredit = rows.reduce((sum, r) => sum + (Number(r.CreditValue) || 0), 0);
  const totalNet = totalDebit - totalCredit;

  const tableRows = rows
    .map(
      (row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${row.Id ?? "—"}</td>
        <td>${row.PaymentDate ?? "—"}</td>
        <td>${row.PaymentDesc ?? "—"}</td>
        <td>${row.DebitValue ?? 0}</td>
        <td>${row.CreditValue ?? 0}</td>
        <td>${(row.DebitValue ?? 0) - (row.CreditValue ?? 0)}</td>
        <td>${row.SubventionTypeName ?? "—"}</td>
        <td>${row.ProjectName ?? "—"}</td>
        <td>${row.UserName ?? "—"}</td>
      </tr>`
    )
    .join("");

  const printContent = `
    <html dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>كشف حساب المكتب</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; }
        h2 { text-align: center; margin-bottom: 5px; }
        h3 { text-align: center; margin-top: 0; color: #444; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #444; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        tfoot td { font-weight: bold; background: #e8f5e9; }
        .info { text-align: center; margin-top: 10px; color: #555; }
        .footer { text-align: center; margin-top: 20px; font-size: 13px; color: #777; }
      </style>
    </head>
    <body>
      <h2>📄 كشف حساب العمليات المالية</h2>
      <h3>${officeName || "اسم المكتب غير متاح"}</h3>
      <div class="info">
        <strong>الفترة:</strong> من ${fromDate} إلى ${toDate}<br>
        <strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>رقم العملية</th>
            <th>التاريخ</th>
            <th>الوصف</th>
            <th>القبض (د.ل)</th>
            <th>الصرف (د.ل)</th>
            <th>الصافي (د.ل)</th>
            <th>نوع الإعانة</th>
            <th>المشروع</th>
            <th>بواسطة</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4">الإجمالي</td>
            <td>${totalDebit.toFixed(2)}</td>
            <td>${totalCredit.toFixed(2)}</td>
            <td>${totalNet.toFixed(2)}</td>
            <td colspan="3"></td>
          </tr>
        </tfoot>
      </table>

      <div class="footer">
        تمت الطباعة بتاريخ ${new Date().toLocaleDateString()} - بواسطة نظام الزكاة والصدقات
      </div>
    </body>
    </html>
  `;

  const newWin = window.open("", "_blank");
  if (newWin) {
    newWin.document.write(printContent);
    newWin.document.close();
    newWin.print();
  }
}

export default function GetStatmentData() {
  const { officeId, officeName } = getSession(); // ✅ نجيب اسم المكتب من الـ session

  const {
    data: bankData,
    isLoading: bankLoading,
    isError: bankError,
  } = useGetDashBankData(officeId);

  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");

  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const params = useMemo(
    () => ({
      officeId: officeId ?? 0,
      accountNum: selectedAccount,
      fromDate: formatDateToMMDDYYYY(fromDate),
      toDate: formatDateToMMDDYYYY(toDate),
    }),
    [officeId, selectedAccount, fromDate, toDate]
  );

  const {
    data: statementData,
    isLoading: statementLoading,
    isError: statementError,
    error,
  } = useGetOfficePayment(params, offset, limit);

  if (bankLoading)
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );

  if (bankError)
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب الحسابات البنكية.
      </Alert>
    );

  const allAccounts = bankData?.rows ?? [];
  const officeAccounts = allAccounts.filter(
    (acc: any) => Number(acc.officeId) === Number(officeId)
  );

  const rows = statementData?.rows ?? [];

  return (
    <Box p={6} dir="rtl">
      <VStack align="stretch" spacing={6}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          كشف حساب المكتب
        </Heading>

        <Text color="gray.600" fontWeight="600">
          المكتب: {officeName || "غير معروف"}
        </Text>

        {/* 🔹 اختيار الحساب البنكي */}
        <Box>
          <Text mb={2} fontWeight="600" color="gray.700">
            اختر رقم الحساب البنكي:
          </Text>
          <Select
            placeholder="اختر رقم الحساب"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {officeAccounts.map((acc: any) => (
              <option key={acc.id} value={acc.accountNumber}>
                {acc.accountNumber} — {acc.bankName}
              </option>
            ))}
          </Select>
        </Box>

        {/* 🔹 فلاتر التاريخ */}
        <HStack spacing={4}>
          <Box flex="1">
            <Text mb={1} fontWeight="600" color="gray.700">
              من تاريخ:
            </Text>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Box>

          <Box flex="1">
            <Text mb={1} fontWeight="600" color="gray.700">
              إلى تاريخ:
            </Text>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Box>
        </HStack>

        {/* 🔹 عرض بيانات كشف الحساب */}
        {statementLoading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : statementError ? (
          <Alert status="error">
            <AlertIcon />
            {(error as Error)?.message ||
              "حدث خطأ أثناء جلب بيانات كشف الحساب."}
          </Alert>
        ) : selectedAccount ? (
          rows.length > 0 ? (
            <>
              <Flex justify="end" mb={3}>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={() =>
                    printAllOperations(rows, officeName, fromDate, toDate)
                  }
                >
                  🖨️ طباعة كشف الحساب بالكامل
                </Button>
              </Flex>

              <Box borderWidth="1px" borderRadius="xl" overflow="hidden">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3} p={4}>
                  {rows.map((row: any, i: number) => (
                    <React.Fragment key={i}>
                      <Text>🔹 رقم العملية: {row.Id ?? "—"}</Text>
                      <Text>📅 التاريخ: {row.PaymentDate ?? "—"}</Text>
                      <Text>🧾 الوصف: {row.PaymentDesc ?? "—"}</Text>
                      <Text>💰 القبض: {row.DebitValue ?? 0}</Text>
                      <Text>💸 الصرف: {row.CreditValue ?? 0}</Text>
                      <Text>
                        ⚖️ الصافي:{" "}
                        {(row.DebitValue ?? 0) - (row.CreditValue ?? 0)}
                      </Text>
                    </React.Fragment>
                  ))}
                </SimpleGrid>
              </Box>
            </>
          ) : (
            <Text color="gray.500" textAlign="center">
              لا توجد بيانات متاحة لهذا الحساب في هذا النطاق الزمني.
            </Text>
          )
        ) : (
          <Text color="gray.500" textAlign="center">
            برجاء اختيار حساب بنكي وتحديد التاريخ لعرض كشف الحساب.
          </Text>
        )}
      </VStack>
    </Box>
  );
}
