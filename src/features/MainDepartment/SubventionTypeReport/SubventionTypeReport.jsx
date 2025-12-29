import React, { useEffect, useState } from "react";
import {
  Select,
  Input,
  Box,
  VStack,
  Text,
  Spinner,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";

import { DataTable } from "../../../Components/Table/DataTable";

import { executeProcedure, PROCEDURE_NAMES } from "../../../api/apiClient";
import { useGetOffices } from "../Offices/hooks/useGetOffices";

const PAGE_LIMIT = 10;

const CampaignReport = () => {
  const userId = getCurrentUserId(); 
  const role = localStorage.getItem("role");
  const officeName = localStorage.getItem("officeName")

  const [selectedStatus, setSelectedStatus] = useState("z");
  const [subventions, setSubventions] = useState("z");
  const [subventionTypesData, setSubventionTypesData] = useState([]);
  const [selectedSubventionTypesData, setSelectedSubventionTypesData] = useState(0);

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [PaymentsData, setPaymentsData] = useState([]);
  const [PaymentsCount, setPaymentsCount] = useState(0);
  const [actionType , setActionType] = useState(0);;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchSubventions = async () => {
      const params = `0#0#${selectedStatus}##${(page - 1) * PAGE_LIMIT + 1}#${PAGE_LIMIT}`;
      const response = await executeProcedure(
        "phjR2bFDp5o0FyA7euBbsp/Ict4BDd2zHhHDfPlrwnk=",
        params
      );
      console.log(response);
      setSubventionTypesData(response.decrypted.data?.Result[0].SubventionTypes ? JSON.parse(response.decrypted.data?.Result[0].SubventionTypes) : [])
    }
    fetchSubventions();
  },[selectedStatus])
  
  /** -------------------- FETCH PAYMENTS ------------------- */
  const fetchPayments = async () => {
      const params = `${selectedSubventionTypesData}#${actionType}#${selectedFromDate}#${selectedToDate}#${(page - 1) * PAGE_LIMIT + 1}#${PAGE_LIMIT}`;
      const response = await executeProcedure(
        "JteoRNKVUn02zs+lm8DOmLaDezyWH94Pq37Ik0cHly8LiBcoJljjxpqYwqw3NL6h",
        params
      );
      console.log(response);
      
      setPaymentsCount(Number(response.decrypted.data?.Result[0].OfficePaymentsCount || 0));
      setPaymentsData(
        response.decrypted.data?.Result[0].OfficePaymentsData ? JSON.parse(response.decrypted.data?.Result[0].OfficePaymentsData) : []
      );
  };

  /** Fetch when page changes */
  useEffect(() => {
    fetchPayments();
  }, [page]);

  /** DataTable Columns */
const columns = [
  {
    header: "التاريخ",
    render: (row) => row.PaymentDate?.split("T")[0] || "-",
    sortable: true,
  },
  {
    header: "وصف الدفع",
    render: (row) => row.PaymentDesc || "-",
  },
  {
    header: "القيمة",
    render: (row) =>
      row.DebitValue !== 0
        ? row.DebitValue
        : row.CreditValue !== 0
        ? row.CreditValue
        : 0,
  },
  {
    header: "نوع العملية",
    render: (row) => row.ActionName || "-",
  },
  {
    header: "نوع الإعانة",
    render: (row) => row.SubventionTypeName || "-",
  },
  {
    header: "المشروع",
    render: (row) => row.ProjectName || "-",
  },
  {
    header: "المكتب",
    render: (row) => row.OfficeName || "-",
  },
  {
    header: "رقم الحساب",
    render: (row) => row.AccountNum || "-",
  },
];


  return (
    <Box p={5}>
      {/* Filters */}

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

                {/* الإعانة */}
                <Box>
                  <Text mb={1}>اختر النوع</Text>
                    <Select
                      value={selectedStatus}
                      padding={3}
                      onChange={(e) => setSelectedStatus(e.target.value || 0)}
                    >
                      <option value="Z">زكاة</option>
                      <option value="S">صدقة</option>
                    </Select>
                </Box>

                <Box>
                  <Text mb={1}>اختر اعانة</Text>
                    <Select
                      value={selectedSubventionTypesData}
                      padding={3}
                      onChange={(e) => setSelectedSubventionTypesData(e.target.value || 0)}
                    >
                      <option key={0} value={0}>
                        اختر اعانة
                      </option>
                      {
                        subventionTypesData.map((s) => (
                          <option key={s.Id} value={s.SubventionTypeId}>
                            {s.SubventionTypeName}
                          </option>
                        ))
                      }
                    </Select>
                </Box>
                 <Box>
                  <Text mb={1}>اختر العملية</Text>
                    <Select
                      value={actionType}
                      padding={3}
                      onChange={(e) => setActionType(e.target.value || 0)}
                    >
                      <option value="0">الكل</option>
                      <option value="1">قبض</option>
                      <option value="2">صرف</option>
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

      {/* DataTable */}
      <Box mt={8}>
        {
          (PaymentsData.length > 0 ?(
            <div id="printable-table">
            <DataTable
              title="انواع الاعانة"
              columns={columns}
              data={PaymentsData}
              page={page}
              pageSize={PAGE_LIMIT}
              onPageChange={setPage}
              totalRows={PaymentsCount}
              startIndex={(page - 1) * PAGE_LIMIT + 1}
            />
          </div>
          ):(
            <p style={{ fontSize: "20px", width: "full", textAlign: "center" }}>
              لا توجد اعانات
            </p>
          )
        )
      }
        {/* زر الطباعة */}
        {PaymentsData.length > 0  && (
          <Button mt={4} w={"full"} onClick={() => window.print()}>
            طباعة
          </Button>
        )}
      </Box>

    </Box>
  );
};

export default CampaignReport;

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
