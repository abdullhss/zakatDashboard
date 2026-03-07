import React, { useState, useMemo, useEffect } from "react";
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

import DataTable from "../../../Components/Table/DataTable";
import Pagination from "../../../Components/Table/Pagination";
import { useGetOfficePayment } from "../../../features/OfficeDashboard/StatementData/hooks/useGetDashBankStatmentData";
import { useGetDashBankData } from "../../MainDepartment/Offices/hooks/useGetDashBankData";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { executeProcedure } from "../../../api/apiClient";

// Helper to format date as MM-DD-YYYY (for API)
function formatDateToMMDDYYYY(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

// Helper to format date as DD/MM/YYYY for display
function formatDateForDisplay(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
}

function getCurrentUserId() {
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

// ========== دالة الطباعة الجديدة (لطباعة الصفحة الحالية) ==========
function printStatement(rowsToPrint, officeName, fromDate, toDate, accountNum, bankName) {
  if (!rowsToPrint.length) {
    alert("لا توجد بيانات للطباعة.");
    return;
  }

  // بناء صفوف الجدول من المصفوفة المعروضة (displayRows)
  let tableRows = '';
  rowsToPrint.forEach(row => {
    // تمييز صف الإجمالي بلون خلفية مختلف (اختياري)
    const rowStyle = row.id === 'page-total' ? ' style="background-color: #e8f5e9; font-weight: bold;"' : '';
    tableRows += `
      <tr${rowStyle}>
        <td>${row.officeName || '—'}</td>
        <td>${row.accountNum || '—'}</td>
        <td>${row.bankName || '—'}</td>
        <td>${row.operationId || '—'}</td>
        <td>${row.systemReference || '—'}</td>
        <td>${row.paymentMethod || '—'}</td>
        <td>${row.paymentDate || '—'}</td>
        <td>${row.description || '—'}</td>
        <td>${row.subventionType || '—'}</td>
        <td>${(row.debit || 0).toFixed(2)}</td>
        <td>${(row.credit || 0).toFixed(2)}</td>
        <td>${(row.net || 0).toFixed(2)}</td>
      </tr>
    `;
  });

  const printContent = `
    <html dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>كشف حساب المكتب - الصفحة الحالية</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; }
        h2 { text-align: center; margin-bottom: 5px; }
        h3 { text-align: center; margin-top: 0; color: #444; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        th, td { border: 1px solid #444; padding: 6px; text-align: center; }
        th { background-color: #f2f2f2; }
        .info { text-align: center; margin-top: 10px; color: #555; }
        .footer { text-align: center; margin-top: 20px; font-size: 13px; color: #777; }
      </style>
    </head>
    <body>
      <h2>📄 كشف حساب العمليات المالية (الصفحة الحالية)</h2>
      <h3>${officeName || "اسم المكتب غير متاح"}</h3>
      <div class="info">
        <strong>الفترة:</strong> من ${fromDate} إلى ${toDate}<br>
        <strong>رقم الحساب:</strong> ${accountNum} - ${bankName}<br>
        <strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>اسم المكتب</th>
            <th>رقم الحساب</th>
            <th>نوع الحساب</th>
            <th>رقم العملية</th>
            <th>رقم التسلسل</th>
            <th>طريقة الدفع</th>
            <th>تاريخ العملية</th>
            <th>الوصف</th>
            <th>نوع الإعانة</th>
            <th>إيرادات (د.ل)</th>
            <th>مصروفات (د.ل)</th>
            <th>الإجمالي الكلي (د.ل)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
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

// (اختياري) يمكنك إبقاء الدالة القديمة معلقة للرجوع إليها لاحقاً
/*
function printAllStatement(rows, officeName, fromDate, toDate, accountNum, bankName) {
  // ... الكود القديم ...
}
*/

export default function MainStatement() {
  const userId = getCurrentUserId();

  // المكتب المختار (null يعني جميع المكاتب)
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  // الحساب المختار (فارغ يعني جميع الحسابات)
  const [selectedAccount, setSelectedAccount] = useState("");
  // التاريخ
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  // نوع الكشف
  const [statementType, setStatementType] = useState("local"); // local | international
  // بيانات الحسابات الدولية
  const [internationalBankAccountsData, setInternationalBankAccountsData] = useState([]);
  const [selectedInternationalAccount, setSelectedInternationalAccount] = useState("");

  // الصفحة الخاصة بالجدول المعروض (وليس pagination API)
  const [dataPage, setDataPage] = useState(1);
  const dataPageSize = 27; // عدد الصفوف في الصفحة الواحدة

  async function getInternationalAccounts() {
    const response = await executeProcedure(
      "ImyBmglW7DWznCguP6on2NPvg+wEyBZypFCDrNeFKn0MOCivVpSW2QdNIPSDoSko",
      3
    );
    const internationalData = JSON.parse(
      response?.decrypted?.data?.Result[0]?.InternationalBankAccountsData || "[]"
    );
    setInternationalBankAccountsData(internationalData);
  }

  useEffect(() => {
    if (statementType === "international") {
      getInternationalAccounts();
      setSelectedOfficeId(null);
      setSelectedAccount("");
      setDataPage(1);
    }
  }, [statementType]);

  // Pagination للـ API (نستخدم limit كبير لجلب كل البيانات دفعة واحدة)
  const [apiPage] = useState(1);
  const limit = 10000; // جلب كمية كبيرة لتغطية كل البيانات
  const offset = useMemo(() => (apiPage - 1) * limit, [apiPage, limit]);

  // جلب كل المكاتب
  const {
    data: officesData,
    isLoading: officesLoading,
    isError: officesError,
  } = useGetOffices(1, 10000, 0);
  const offices = officesData?.rows ?? [];

  // جلب الحسابات البنكية حسب المكتب (يتم تفعيله فقط عند اختيار مكتب محدد)
  const {
    data: bankData,
    isLoading: bankLoading,
    isError: bankError,
  } = useGetDashBankData(selectedOfficeId ?? 0, {
    enabled: !!selectedOfficeId,
  });
  const allAccounts = bankData?.rows ?? [];
  const officeAccounts = selectedOfficeId
    ? allAccounts.filter((acc) => Number(acc.officeId) === Number(selectedOfficeId))
    : [];

  // بناء بارامترات طلب كشف الحساب
  const params = useMemo(() => {
    if (statementType === "international") {
      return {
        officeId: -1,
        accountNum: selectedInternationalAccount,
        fromDate: formatDateToMMDDYYYY(fromDate),
        toDate: formatDateToMMDDYYYY(toDate),
      };
    } else {
      return {
        officeId: selectedOfficeId ?? -1,
        accountNum: selectedAccount || "",
        fromDate: formatDateToMMDDYYYY(fromDate),
        toDate: formatDateToMMDDYYYY(toDate),
      };
    }
  }, [selectedOfficeId, selectedAccount, fromDate, toDate, statementType, selectedInternationalAccount]);

  const {
    data: statementData,
    isLoading: statementLoading,
    isError: statementError,
    error,
  } = useGetOfficePayment(params, offset, limit);

  const rows = statementData?.rows ?? [];

  // تجهيز الصفوف المعروضة مع الرصيد الافتتاحي وإجمالي الصفحة
  const totalDataRows = rows.length;
  const startIdx = (dataPage - 1) * dataPageSize;
  const endIdx = Math.min(startIdx + dataPageSize, totalDataRows);
  const dataRowsForPage = rows.slice(startIdx, endIdx);

  // حساب المجاميع التراكمية قبل هذه الصفحة
  const previousRows = rows.slice(0, startIdx);
  const previousTotalDebit = previousRows.reduce((sum, r) => sum + (Number(r.DebitValue) || 0), 0);
  const previousTotalCredit = previousRows.reduce((sum, r) => sum + (Number(r.CreditValue) || 0), 0);
  const previousNet = previousTotalDebit - previousTotalCredit;

  // مجاميع الصفحة الحالية
  const pageDebit = dataRowsForPage.reduce((sum, r) => sum + (Number(r.DebitValue) || 0), 0);
  const pageCredit = dataRowsForPage.reduce((sum, r) => sum + (Number(r.CreditValue) || 0), 0);
  const cumulativeDebit = previousTotalDebit + pageDebit;
  const cumulativeCredit = previousTotalCredit + pageCredit;
  const cumulativeNet = cumulativeDebit - cumulativeCredit;

  // بناء صفوف العرض
  const displayRows = [];

  // صف الرصيد الافتتاحي (أول صفحة فقط) أو رصيد ماقبله للصفحات التالية
  displayRows.push({
    id: 'prev',
    officeName: '—',
    accountNum: selectedAccount || (statementType === 'international' ? selectedInternationalAccount : '—'),
    bankName: '—',
    operationId: '—',
    systemReference: dataPage === 1 ? 'رصيد أول المدة' : 'رصيد ماقبله',
    paymentMethod: '—',
    paymentDate: '—',
    description: '—',
    subventionType: '—',
    debit: previousTotalDebit,
    credit: previousTotalCredit,
    net: previousNet,
  });

  // صفوف البيانات
  dataRowsForPage.forEach((row) => {
    displayRows.push({
      id: row.Id,
      officeName: row.OfficeName || '—',
      accountNum: row.AccountNum || '—',
      bankName: row.BankName || '—',
      operationId: row.Id,
      systemReference: row.SystemReference || '—',
      paymentMethod: row.PaymentMethodName || '—',
      paymentDate: formatDateForDisplay(row.PaymentDate),
      description: row.PaymentDesc || '—',
      subventionType: row.SubventionTypeName || '—',
      debit: Number(row.DebitValue) || 0,
      credit: Number(row.CreditValue) || 0,
      net: Number(row.RunningTotal) || 0,
    });
  });

  // صف إجمالي الصفحة (إذا كان هناك بيانات)
  if (dataRowsForPage.length > 0) {
    displayRows.push({
      id: 'page-total',
      officeName: '—',
      accountNum: '—',
      bankName: '—',
      operationId: '—',
      systemReference: 'إجمالي الصفحة',
      paymentMethod: '—',
      paymentDate: '—',
      description: '—',
      subventionType: '—',
      debit: cumulativeDebit,
      credit: cumulativeCredit,
      net: cumulativeNet,
    });
  }

  // تعريف الأعمدة حسب الطلب
  const columns = [
    { header: 'اسم المكتب', accessor: 'officeName' },
    { header: 'رقم الحساب', accessor: 'accountNum' },
    { header: 'نوع الحساب', accessor: 'bankName' },
    { header: 'رقم العملية', accessor: 'operationId' },
    { header: 'رقم التسلسل', accessor: 'systemReference' },
    { header: 'طريقة الدفع', accessor: 'paymentMethod' },
    { header: 'تاريخ العملية', accessor: 'paymentDate' },
    { header: 'الوصف', accessor: 'description' },
    { header: 'نوع الإعانة', accessor: 'subventionType' },
    { header: 'إيرادات', accessor: 'debit', isNumeric: true },
    { header: 'مصروفات', accessor: 'credit', isNumeric: true },
    { header: 'الإجمالي الكلي', accessor: 'net', isNumeric: true },
  ];

  return (
    <Box p={6} dir="rtl">
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">كشف حساب المكتب</Heading>

        <Tabs
          isFitted
          variant="enclosed"
          onChange={(index) => {
            setStatementType(index === 0 ? "local" : "international");
            setDataPage(1);
          }}
        >
          <TabList mb="1em">
            <Tab>محلي</Tab>
            <Tab>دولي</Tab>
          </TabList>

          <TabPanels>
            {/* ================= محلي ================= */}
            <TabPanel>
              <Box>
                <Text mb={2} fontWeight="600">اختر المكتب (اختياري):</Text>
                <Select
                  placeholder="جميع المكاتب"
                  value={selectedOfficeId ?? ""}
                  padding={3}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedOfficeId(val ? Number(val) : null);
                    setSelectedAccount("");
                    setDataPage(1);
                  }}
                >
                  {offices.map((office) => (
                    <option key={office.Id} value={office.Id}>
                      {office.OfficeName}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box mt={4}>
                <Text mb={2} fontWeight="600">اختر رقم الحساب البنكي (اختياري):</Text>
                <Select
                  placeholder="جميع الحسابات"
                  padding={3}
                  value={selectedAccount}
                  onChange={(e) => {
                    setSelectedAccount(e.target.value);
                    setDataPage(1);
                  }}
                >
                  {officeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} — {acc.bankName}
                    </option>
                  ))}
                </Select>
              </Box>
            </TabPanel>

            {/* ================= دولي ================= */}
            <TabPanel>
              <Box>
                <Text mb={2} fontWeight="600">الحسابات البنكية الدولية:</Text>
                <Select
                  placeholder="اختر الحساب الدولي"
                  padding={3}
                  value={selectedInternationalAccount}
                  onChange={(e) => {
                    setSelectedInternationalAccount(e.target.value);
                    setDataPage(1);
                  }}
                >
                  {internationalBankAccountsData.map((acc, index) => (
                    <option key={index} value={acc.AccountNum}>
                      {acc.AccountNum} — {acc.BankName}
                    </option>
                  ))}
                </Select>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* حقول التاريخ (مشتركة) */}
        <HStack spacing={4}>
          <Box flex="1">
            <Text mb={1} fontWeight="600">من تاريخ:</Text>
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
            <Text mb={1} fontWeight="600">إلى تاريخ:</Text>
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

        {/* عرض البيانات */}
        {statementLoading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : statementError ? (
          <Alert status="error">
            <AlertIcon />
            {(error instanceof Error ? error.message : "حدث خطأ أثناء جلب البيانات.")}
          </Alert>
        ) : rows.length > 0 ? (
          <>
            <Flex justify="end" mb={3}>
              <Button
                colorScheme="green"
                size="sm"
                onClick={() => {
                  // تحديد اسم المكتب للطباعة (إذا كان مختارًا)
                  let officeNameForPrint = "جميع المكاتب";
                  if (selectedOfficeId) {
                    const off = offices.find(o => o.Id === selectedOfficeId);
                    officeNameForPrint = off?.OfficeName || "المكتب المحدد";
                  }
                  // تحديد رقم الحساب واسم البنك للطباعة
                  let accountNumForPrint = selectedAccount || "جميع الحسابات";
                  let bankNameForPrint = "—";
                  if (selectedAccount && officeAccounts.length > 0) {
                    const acc = officeAccounts.find(a => a.accountNumber === selectedAccount);
                    bankNameForPrint = acc?.bankName || "—";
                  }
                  if (statementType === "international") {
                    accountNumForPrint = selectedInternationalAccount;
                    const intAcc = internationalBankAccountsData.find(a => a.AccountNum === selectedInternationalAccount);
                    bankNameForPrint = intAcc?.BankName || "—";
                  }
                  // استدعاء دالة الطباعة الجديدة وتمرير displayRows
                  printStatement(displayRows, officeNameForPrint, fromDate, toDate, accountNumForPrint, bankNameForPrint);
                }}
              >
                🖨️ طباعة الصفحة الحالية
              </Button>
            </Flex>

            <Box borderWidth="1px" borderRadius="xl" overflow="hidden" p={4}>
              <DataTable
                data={displayRows}
                columns={columns.map((col) => ({
                  key: col.accessor,
                  header: col.header,
                  render: (row) => {
                    let value = row[col.accessor];
                    if (col.isNumeric && typeof value === "number") {
                      value = value.toFixed(2);
                    }
                    return value;
                  },
                }))}
                viewHashTag={false}
                getRowProps={(row) => ({
                  bg: row.id === "page-total" ? "gray.50" : undefined,
                })}
              />

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
            لا توجد بيانات متاحة لهذا النطاق الزمني.
          </Text>
        )}
      </VStack>
    </Box>
  );
}