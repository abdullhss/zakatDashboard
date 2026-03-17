import React, { useEffect, useState } from 'react'
import {
  Select,
  Box,
  Text,
  Spinner,
  Button,
  SimpleGrid
} from "@chakra-ui/react";
import { executeProcedure } from "../../../api/apiClient";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { DataTable } from "../../../Components/Table/DataTable";

const PAGE_LIMIT = 10;

const UnApprovedPaymentsReport = () => {

  const role = localStorage.getItem("role");
  const officeName = localStorage.getItem("officeName");
  const mainUserData = localStorage.getItem("mainUser");

  const OfficeId = mainUserData ? JSON.parse(mainUserData).Office_Id : 0;

  const [selectedOffice, setSelectedOffice] = useState(() => {
    return role == "O" ? OfficeId : -1;
  });

  const [PaymentsData, setPaymentsData] = useState([]);
  const [PaymentsCount, setPaymentsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  /** -------------------- GET OFFICES ------------------- */
  const {
    data: officesData,
    isLoading: officesLoading,
  } = useGetOffices(1, 10000, 0);

  const PAYMENTS_COLUMNS = [
    {
      key: "OfficeName",
      header: "اسم المكتب",
      render: (row) => row.OfficeName || "-",
    },
    {
      key: "AllPayments",
      header: "إجمالي المدفوعات",
      render: (row) => row.AllPayments ?? 0,
    },
    {
      key: "TodayPayments",
      header: "مدفوعات اليوم",
      render: (row) => row.TodayPayments ?? 0,
    },
  ];

  /** -------------------- FETCH PAYMENTS ------------------- */
  const fetchPayments = async () => {
    if (selectedOffice === 0 || selectedOffice === null || selectedOffice === undefined) return;

    setLoading(true);

    try {
      const params = `${selectedOffice}#${(page - 1) * PAGE_LIMIT + 1}#${PAGE_LIMIT}`;

      const response = await executeProcedure(
        "r169QfEEvdmZWKnmCCXG2apOMxMO3Hv7X38g6PZQi60=",
        params
      );
      console.log(response);
      

      setPaymentsCount(
        Number(response.decrypted.data?.Result[0].PaymentsCount)
      );

      setPaymentsData(
        response.decrypted.data?.Result[0].PaymentsData
          ? JSON.parse(
              response.decrypted.data?.Result[0].PaymentsData
            )
          : []
      );
    } finally {
      setLoading(false);
    }
  };

  /** -------------------- AUTO FETCH ------------------- */
  useEffect(() => {
    fetchPayments();
  }, [page, selectedOffice]);

  console.log(PaymentsData);
  
  return (
    <Box p={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

        {/* اختيار المكتب */}
        <Box>
          <Text mb={1}>اختر المكتب</Text>

          {role === "O" ? (
            <Box
              mt={4}
              padding={3}
              border="1px solid #E2E8F0"
              borderRadius="md"
              bg="gray.100"
            >
              {officeName}
            </Box>
          ) : officesLoading ? (
            <Spinner />
          ) : (
            <Select
              placeholder="اختر المكتب"
              value={String(selectedOffice)}
              padding={3}
              onChange={(e) => {
                const value = e.target.value === "" ? -1 : Number(e.target.value);
                setSelectedOffice(value);
                setPage(1);
              }}
            >
              <option value={-1}>جميع المكاتب</option>
              {officesData?.rows?.map((o) => (
                <option key={o.Id} value={o.Id}>
                  {o.OfficeName}
                </option>
              ))}
            </Select>
          )}
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
              title="مدفوعات المكاتب"
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
        <p
          style={{
            fontSize: "20px",
            width: "100%",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          لا توجد مدفوعات
        </p>
      )}
    </Box>
  );
};

export default UnApprovedPaymentsReport;