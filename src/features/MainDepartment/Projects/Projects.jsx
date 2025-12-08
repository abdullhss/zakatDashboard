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

const Projects = () => {
  const userId = getCurrentUserId(); 
  const role = localStorage.getItem("role");
  const officeName = localStorage.getItem("officeName")
  const mainUserData = localStorage.getItem("mainUser")
  const OfficeId = mainUserData?JSON.parse(mainUserData).Office_Id : 0 ;
  const [selectedOffice, setSelectedOffice] = useState(()=>{return(role=="O"? OfficeId : 0)});
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [selectedProject_Id, setSelectedProject_Id] = useState(0);
  const [projects, setProjects] = useState([]);

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [PaymentsData, setPaymentsData] = useState([]);
  const [PaymentsCount, setPaymentsCount] = useState(0);
  const [page, setPage] = useState(1);

  /** -------------------- GET OFFICES ------------------- */
  const { data: officesData, isLoading: officesLoading } = useGetOffices(
    1,
    10000,
    userId
  );

  /** -------------------- GET SUBVENTIONS ------------------- */

  /** -------------------- GET PROJECTS BY OFFICE ------------------- */
  useEffect(() => {
    if (!selectedOffice) return;

    const getProjects = async () => {
      const params = `${selectedOffice}#N#1#10000`;

      const res = await executeProcedure(
        PROCEDURE_NAMES.GetDashBoardOfficeProjectsData,
        params
      );
      setProjects(res.rows || []);
    };

    getProjects();
  }, [selectedOffice]);

  /** -------------------- FETCH PAYMENTS ------------------- */
  const fetchPayments = async () => {
    if(selectedProject_Id!=0 && selectedOffice!=0 ){
      const params = `${selectedProject_Id}#${selectedStatus}#${selectedFromDate}#${selectedToDate}#${(page - 1) * PAGE_LIMIT + 1}#${PAGE_LIMIT}`;
      const response = await executeProcedure(
        "GMsU6f48hgetwzDlgiPhATMetDyVNsb7AWn69gdli4c=",
        params
      );
      console.log(response);
      
      setPaymentsCount(Number(response.decrypted.data?.Result[0].OfficePaymentsCount));
      setPaymentsData(
        response.decrypted.data?.Result[0].OfficePaymentsData ? JSON.parse(response.decrypted.data?.Result[0].OfficePaymentsData) : []
      );
    }
  };

  /** Fetch when page changes */
  useEffect(() => {
    fetchPayments();
  }, [page]);

  /** DataTable Columns */
const columns = [
  {
    header: "التاريخ",
    render: (row) => row.PaymentDate?.split("T")[0],
    sortable: true,
  },
  { header: "بيان الدفع", render: (row) => row.PaymentDesc || "-" },
  { 
    header: "القيمة", 
    render: (row) => row.DebitValue || row.CreditValue || 0  
  },
  { header: "نوع العملية", render: (row) => row.ActionName || "-" },
  { header: "نوع الإعانة", render: (row) => row.SubventionTypeName || "-" },
  { header: "المشروع", render: (row) => row.ProjectName || "-" },
  { header: "المكتب", render: (row) => row.OfficeName || "-" },
  { header: "البنك", render: (row) => row.BankName || "-" },
  { header: "رقم الحساب", render: (row) => row.AccountNum || "-" },
];

  return (
    <Box p={5}>
      {/* Filters */}

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

                {/* المشروع */}
                <Box>
                  <Text mb={1}>اختر المشروع</Text>
                  <Select
                    placeholder="اختر المشروع"
                    value={selectedProject_Id}
                    padding={3}
                    onChange={(e) => setSelectedProject_Id(e.target.value || 0)}
                  >
                    {projects?.map((p) => (
                      <option key={p.Id} value={p.Id}>
                        {p.Name}
                      </option>
                    ))}
                  </Select>
                </Box>


                {/* الإعانة */}
                <Box>
                  <Text mb={1}>اختر الحالة</Text>
                    <Select
                      placeholder="اختر الإعانة"
                      value={selectedStatus}
                      padding={3}
                      onChange={(e) => setSelectedStatus(e.target.value || 0)}
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
        {selectedProject_Id!=0 && selectedOffice!=0 ? (
          PaymentsData.length > 0?(
            <div id="printable-table">
            <DataTable
              title="المشاريع"
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
              لا توجد مشاريع
            </p>
          )
        ) : (
            <p style={{ fontSize: "20px", width: "full", textAlign: "center" }}>
            يرجى اختيار المكتب والمشروع لعرض البيانات
            </p>
        )}

        {/* زر الطباعة */}
        {PaymentsData.length > 0 && selectedProject_Id!=0 && selectedOffice!=0  && (
          <Button mt={4} w={"full"} onClick={() => window.print()}>
            طباعة
          </Button>
        )}
      </Box>

    </Box>
  );
};

export default Projects;

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
