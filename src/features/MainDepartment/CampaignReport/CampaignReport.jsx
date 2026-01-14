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
import { InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useImagesPathContext } from "../../../Context/ImagesPathContext";
const PAGE_LIMIT = 10;

const CampaignReport = () => {
  const userId = getCurrentUserId(); 
  const role = localStorage.getItem("role");
  const officeName = localStorage.getItem("officeName")
  const { imagesPath } = useImagesPathContext();
  const [selectedStatus, setSelectedStatus] = useState(0);

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [PaymentsData, setPaymentsData] = useState([]);
  const [PaymentsCount, setPaymentsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText , setSearchText] =useState("") ;
  /** -------------------- FETCH PAYMENTS ------------------- */
  const fetchPayments = async () => {
      const params = `${selectedStatus}#${selectedFromDate}#${selectedToDate}#${searchText}#${(page - 1) * PAGE_LIMIT + 1}#${PAGE_LIMIT}`;
      const response = await executeProcedure(
        "hLtCUTex0yBDefDmIESoYorZ5Io7Ef07D6ozygPR/Sg=",
        params
      );
      console.log(response);
      
      setPaymentsCount(Number(response.decrypted.data?.Result[0].CampaignsCount || 0));
      setPaymentsData(
        response.decrypted.data?.Result[0].CampaignsData ? JSON.parse(response.decrypted.data?.Result[0].CampaignsData) : []
      );
  };

  /** Fetch when page changes */
  useEffect(() => {
    fetchPayments();
  }, [page]);

  /** DataTable Columns */
const columns = [
  {
    header: "اسم الحملة",
    render: (row) => row.CampaignName || "-",
  },
  {
    header: "نوع الحملة",
    render: (row) => row.CampaignType || "-",
  },
  {
    header: "المبلغ المطلوب",
    render: (row) => row.WantedAmount?.toLocaleString() || 0,
  },
  {
    header: "المبلغ المتبقي",
    render: (row) => row.CampaignRemainingAmount?.toLocaleString() || 0,
  },
  {
    header: "تاريخ الإنشاء",
    render: (row) => row.CreatedDate?.split("T")[0] || "-",
    sortable: true,
  },
  {
    header: "اسم المستخدم",
    render: (row) => row.UserName || "-",
  },
  {
    header: "عرض الصورة",
    render: (r) => {
      return <a style={{color:"#005599"}} target="_blank" href={`${imagesPath}/${r.CampaignPhotoName}.jpg`}>
        عرض
      </a>;
    },
  },
  {
    header: "الحالة",
    render: (row) => row.Status || "-",
  },
];

const handleSearch = () => {
  setPage(1);
  fetchPayments();
};

  return (
    <Box p={5}>
              {/* Search Bar */}
              <Box mb={6}>
                <InputGroup>
                  <Input
                    placeholder="ابحث باسم المستخدم..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    padding={3}
                    onKeyDown={(e)=>{
                      if(e.key == "Enter"){
                        handleSearch() ;
                      }
                    }}
                  />
                </InputGroup>
              </Box>

              {/* Filters */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

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
                      <option value="1">مقبول</option>
                      <option value="2">مرفوض</option>
                    </Select>
                </Box>
                        {/* من تاريخ */}
                <Box mt={3}>
                  <Text mb={1}>من تاريخ</Text>
                  <Input
                    type="date"
                    value={selectedFromDate}
                    onChange={(e) => setSelectedFromDate(e.target.value)}
                  />
                </Box>
        
              </SimpleGrid>
        
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
        

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
                    onClick={handleSearch}
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
              title="الحملات"
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
              لا توجد حملات
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
