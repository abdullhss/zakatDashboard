import React, { useEffect, useState } from 'react'
import {
  Select,
  Input,
  Box,
  VStack,
  Text,
  Spinner,
  Button,
  SimpleGrid
} from "@chakra-ui/react";
import { executeProcedure, PROCEDURE_NAMES } from "../../../api/apiClient";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { DataTable } from "../../../Components/Table/DataTable";


const PAGE_LIMIT = 10 
const SacirificeReport = () => {

  
  const userId = getCurrentUserId(); 
  const role = localStorage.getItem("role");
  const officeName = localStorage.getItem("officeName")
  const mainUserData = localStorage.getItem("mainUser")
  const OfficeId = mainUserData?JSON.parse(mainUserData).Office_Id : 0 ;
  const [selectedOffice, setSelectedOffice] = useState(()=>{return(role=="O"? OfficeId : 0)});

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [PaymentsData , setPaymentsData] = useState([])
  const [PaymentsCount , setPaymentsCount] = useState(0)
  const [page, setPage] = useState(1)
  const [ selectedActionType , setSelectedActionType] = useState(0); 
  const [loading, setLoading] = useState(false);

  /** -------------------- GET OFFICES ------------------- */
  const {
    data: officesData,
    isLoading: officesLoading,
  } = useGetOffices(1, 10000, 0);


const PAYMENTS_COLUMNS = [
  {
    key: "PaymentDate",
    header: "التاريخ",
    render: (row) => row.PaymentDate?.split("T")[0] ?? "-",
  },
  {
    key: "DebitValue",
    header: "القيمة",
    render: (row) => row.DebitValue,
  },
  {
    key: "ActionName",
    header: "نوع العملية",
    render: (row) => row.ActionName || "-",
  },
  {
    key: "OfficeName",
    header: "المكتب",
    render: (row) => row.OfficeName || "-",
  },
  {
    key: "BankName",
    header: "البنك",
    render: (row) => row.BankName || "-",
  },
  {
    key: "AccountNum",
    header: "رقم الحساب",
    render: (row) => row.AccountNum || "-",
  },
  {
    key: "ActionType",
    header: "نوع الإجراء",
    render: (row) => row.ActionType == 1 ? "قبض" : "صرف",
  },
];


  /** -------------------- FETCH PAYMENTS ------------------- */
    const fetchPayments = async () => {
    setLoading(true);

    try {
        const params = `${selectedOffice}#8#${selectedActionType}#${selectedFromDate}#${selectedToDate}#${(page-1)*PAGE_LIMIT + 1}#${PAGE_LIMIT}`;

        const response = await executeProcedure(
        "TgaMSNBzZb/muT2Qs4e9OwgDFolFOqlbFSoXxFCuiMg=",
        params
        );

        setPaymentsCount(Number(response.decrypted.data?.Result[0].OfficePaymentsCount));
        setPaymentsData(
        response.decrypted.data?.Result[0].OfficePaymentsData
            ? JSON.parse(response.decrypted.data?.Result[0].OfficePaymentsData)
            : []
        );
    } finally {
        setLoading(false); // ينتهي اللودر
    }
    };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  console.log(PaymentsData);
  

  return (
    <Box p={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

        {/* مكتب */}
        <Box>
          <Text mb={1}>اختر المكتب</Text>

          {role === "O" ? (
            // لو role O → اعرض اسم المكتب فقط
            <Box
            mt={4}
              padding={3}
              border="1px solid #E2E8F0"
              borderRadius="md"
              bg="gray.100"
            >
              {officeName}
            </Box>
          ) : (
            // لو مش O → اعرض Select
            officesLoading ? (
              <Spinner />
            ) : (
              <Select
                placeholder="اختر المكتب"
                value={selectedOffice}
                padding={3}
                onChange={(e) => {
                  setSelectedOffice(e.target.value || 0);
                  setSelectedProject_Id(0);
                }}
              >
                {officesData?.rows?.map((o) => (
                  <option key={o.Id} value={o.Id}>
                    {o.OfficeName}
                  </option>
                ))}
              </Select>
            )
          )}
        </Box>

        <Box>
          <Text mb={1}>نوع العملية</Text>
            <Select
              placeholder="النوع"
              value={selectedActionType}
              padding={3}
              onChange={(e) => setSelectedActionType(e.target.value || 0)}
            >
                <option key={0} value={0}>
                    الكل
                </option>
                <option key={1} value={1}>
                    قبض
                </option>
                <option key={2} value={2}>
                    صرف
                </option>
            </Select>
        </Box>

      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>

        {/* من تاريخ */}
        <Box>
          <Text mb={1}>من تاريخ</Text>
          <Input
            type="date"
            value={selectedFromDate}
            onChange={(e) => setSelectedFromDate(e.target.value)}
          />
        </Box>

        {/* إلى تاريخ */}
        <Box>
          <Text mb={1}>إلى تاريخ</Text>
          <Input
            type="date"
            value={selectedToDate}
            onChange={(e) => setSelectedToDate(e.target.value)}
          />
        </Box>

        {/* زر البحث */}
        <Box display="flex" alignItems="flex-end">
          <Button
            width="100%"
            padding={3}
            onClick={() => {
              setPage(1);
              fetchPayments();
            }}
          >
            بحث
          </Button>
        </Box>

      </SimpleGrid>


    {loading ? (
      <Box mt={10} display="flex" justifyContent="center">
        <Spinner size="xl" thickness="4px" />
      </Box>
    ) : PaymentsData.length > 0 ? (
      <Box mt={6}>
        <div id="printable-table">
          <DataTable
            title="الاضاحي"
            data={PaymentsData}
            columns={PAYMENTS_COLUMNS}
            page={page}
            pageSize={PAGE_LIMIT}
            onPageChange={setPage}
            totalRows={PaymentsCount}
            startIndex={(page - 1) * PAGE_LIMIT + 1}
          />
        </div>

        {/* زر الطباعة */}
        <Button mt={4} w={"full"} onClick={() => window.print()}>
          طباعة
        </Button>
      </Box>
    ) : (
      <p style={{ fontSize:"20px", width:"full", textAlign:"center" }}>
        لا توجد مدفوعات
      </p>
    )}


    </Box>
  );
};

export default SacirificeReport;

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
  } catch { }
  return 1;
}
