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
import { useGetOfficePayment } from "./hooks/useGetDashBankStatmentData";
import { useGetDashBankData } from "../../MainDepartment/Offices/hooks/useGetDashBankData";
import { getSession } from "../../../session";
import DataTable from "../../../Components/Table/DataTable";
import Pagination from "../../../Components/Table/Pagination"; // adjust path if needed

// Helper to format date as MM-DD-YYYY
function formatDateToMMDDYYYY(date: string | Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

// Print function (unchanged)
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
  const { officeId, officeName } = getSession();

  // All hooks must be called unconditionally at the top level
  const {
    data: bankData,
    isLoading: bankLoading,
    isError: bankError,
  } = useGetDashBankData(officeId);

  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const today = new Date();
  const year = today.getFullYear();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(`${year}-01-01`);
  const [toDate, setToDate] = useState(formatDate(today));

  // Pagination for the API call (fetching up to 10,000 rows)
  const [apiPage, setApiPage] = useState(1);
  const limit = 10000;
  const offset = useMemo(() => (apiPage - 1) * limit, [apiPage, limit]);

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

  // Local pagination state for the displayed table
  const [dataPage, setDataPage] = useState(1);

  // Early returns after all hooks
  if (bankLoading) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (bankError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب الحسابات البنكية.
      </Alert>
    );
  }

  const allAccounts = bankData?.rows ?? [];
  const officeAccounts = allAccounts.filter(
    (acc: any) => Number(acc.officeId) === Number(officeId)
  );

  const rows = statementData?.rows ?? [];

  // --- Pagination for the displayed table (27 data rows per page) ---
  const dataPageSize = 27; // number of actual data rows per page (excluding opening balance and page total)

  const totalDataRows = rows.length;
  const totalDataPages = Math.ceil(totalDataRows / dataPageSize);

  // Slice the data for current page
  const startIdx = (dataPage - 1) * dataPageSize;
  const endIdx = Math.min(startIdx + dataPageSize, totalDataRows);
  const dataRowsForPage = rows.slice(startIdx, endIdx);

  // Cumulative totals before this page (for opening balance row)
  const previousRows = rows.slice(0, startIdx);
  const previousTotalDebit = previousRows.reduce((sum, r) => sum + (Number(r.DebitValue) || 0), 0);
  const previousTotalCredit = previousRows.reduce((sum, r) => sum + (Number(r.CreditValue) || 0), 0);
  const previousNet = previousTotalDebit - previousTotalCredit;

  // Totals for the current page (for page total row)
  const pageDebit = dataRowsForPage.reduce((sum, r) => sum + (Number(r.DebitValue) || 0), 0);
  const pageCredit = dataRowsForPage.reduce((sum, r) => sum + (Number(r.CreditValue) || 0), 0);
  const pageNet = pageDebit - pageCredit;

  // Cumulative totals including previous balance (for page total row)
  const cumulativeDebit = previousTotalDebit + pageDebit;
  const cumulativeCredit = previousTotalCredit + pageCredit;
  const cumulativeNet = cumulativeDebit - cumulativeCredit; // same as previousNet + pageNet

  // Get bank name from selected account
  const selectedAccountObj = officeAccounts.find(acc => acc.accountNumber === selectedAccount);
  const bankName = selectedAccountObj?.bankName || '—';

  // Build the rows to display (1 opening balance + up to 27 data rows + 1 page total)
  const displayRows = [];

  // 1. Opening balance / previous cumulative row
  displayRows.push({
    id: 'prev',
    officeName: officeName || '—',
    accountNum: selectedAccount,
    bankName: bankName,
    operationId: '—',
    seqNum: '—',
    paymentMethod: '—',
    paymentDate: '—',
    description: dataPage === 1 ? 'رصيد أول المدة' : 'رصيد ماقبله',
    subventionType: '—',
    debit: previousTotalDebit,
    credit: previousTotalCredit,
    net: previousNet,
  });

  // 2. Data rows (up to 27)
  dataRowsForPage.forEach((row) => {
    displayRows.push({
      id: row.Id,
      officeName: row.OfficeName || officeName || '—',
      accountNum: row.AccountNum || selectedAccount,
      bankName: row.BankName || bankName,
      operationId: row.Id,
      seqNum: row.row_num || '—',
      paymentMethod: row.ActionName || '—',
      paymentDate: row.PaymentDate ? new Date(row.PaymentDate).toLocaleDateString('en-GB') : '—',
      description: row.PaymentDesc || '—',
      subventionType: row.SubventionTypeName || '—',
      debit: Number(row.DebitValue) || 0,
      credit: Number(row.CreditValue) || 0,
      net: Number(row.RunningTotal) || 0,
    });
  });

  // 3. Page total row (only if there is at least one data row)
  if (dataRowsForPage.length > 0) {
    displayRows.push({
      id: 'page-total',
      officeName: officeName || '—',
      accountNum: selectedAccount,
      bankName: bankName,
      operationId: '—',
      seqNum: '—',
      paymentMethod: '—',
      paymentDate: '—',
      description: 'إجمالي الصفحة',
      subventionType: '—',
      debit: cumulativeDebit,
      credit: cumulativeCredit,
      net: cumulativeNet,
    });
  }

  // Column definitions for DataTable
  const columns = [
    { header: 'اسم المكتب', accessor: 'officeName', isNumeric: false },
    { header: 'رقم الحساب', accessor: 'accountNum', isNumeric: false },
    { header: 'نوع الحساب', accessor: 'bankName', isNumeric: false },
    { header: 'رقم العملية', accessor: 'operationId', isNumeric: false },
    { header: 'رقم التسلسل', accessor: 'seqNum', isNumeric: false },
    { header: 'طريقة الدفع', accessor: 'paymentMethod', isNumeric: false },
    { header: 'تاريخ العملية', accessor: 'paymentDate', isNumeric: false },
    { header: 'الوصف', accessor: 'description', isNumeric: false },
    { header: 'نوع الإعانة', accessor: 'subventionType', isNumeric: false },
    { header: 'إيرادات', accessor: 'debit', isNumeric: true },
    { header: 'مصروفات', accessor: 'credit', isNumeric: true },
    { header: 'الإجمالي الكلي', accessor: 'net', isNumeric: true },
  ];

  return (
    <Box p={6} dir="rtl">
      <VStack align="stretch" spacing={6}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          كشف حساب المكتب
        </Heading>

        <Text color="gray.600" fontWeight="600">
          المكتب: {officeName || "غير معروف"}
        </Text>

        {/* Bank account selection */}
        <Box>
          <Text mb={2} fontWeight="600" color="gray.700">
            اختر رقم الحساب البنكي:
          </Text>
          <Select
            mx={-3}
            px={3}
            placeholder="اختر رقم الحساب"
            value={selectedAccount}
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              setDataPage(1); // reset data page when account changes
            }}
          >
            {officeAccounts.map((acc: any) => (
              <option key={acc.id} value={acc.accountNumber}>
                {acc.accountNumber} — {acc.bankName}
              </option>
            ))}
          </Select>
        </Box>

        {/* Date filters */}
        <HStack spacing={4}>
          <Box flex="1">
            <Text mb={1} fontWeight="600" color="gray.700">
              من تاريخ:
            </Text>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setDataPage(1);
              }}
            />
          </Box>

          <Box flex="1">
            <Text mb={1} fontWeight="600" color="gray.700">
              إلى تاريخ:
            </Text>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setDataPage(1);
              }}
            />
          </Box>
        </HStack>

        {/* Data display */}
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

              {/* DataTable with custom rows */}
              <Box borderWidth="1px" borderRadius="xl" overflow="hidden" p={4}>
                <DataTable
                  data={displayRows}
                  columns={columns.map(col => ({
                    key: col.accessor,
                    header: col.header,
                    render: (row: any) => {
                      let value = row[col.accessor];
                      if (col.isNumeric && typeof value === 'number') {
                        value = value.toFixed(2);
                      }
                      return value;
                    }
                  }))}
                  viewHashTag={false} // we have our own "رقم التسلسل" column
                  // Pass a function to style the page total row
                  getRowProps={(row: any) => ({
                    bg: row.id === 'page-total' ? 'gray.50' : undefined,
                  })}
                />

                {/* Pagination component for page selection */}
                {rows.length > 0 && (
                  <Flex justify="center" mt={4}>
                    <Pagination
                      page={dataPage}
                      pageSize={dataPageSize}
                      totalRows={totalDataRows}
                      onPageChange={setDataPage}
                      maxVisible={5}
                    />
                  </Flex>
                )}
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