import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  Text,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import { executeProcedure } from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 100;

const OutFitrTable = () => {
  const mainUser = JSON.parse(localStorage.getItem("mainUser"));
  const officeId = mainUser.Office_Id;
  const navigate = useNavigate();
  const toast = useToast();

  const [outFitrData, setOutFitrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);

  // MM-DD-YYYY
  const [outputDate, setOutputDate] = useState(
    new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")
  );

  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  // ========================
  // Fetch Data
  // ========================
  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await executeProcedure(
        "6Ww2MAzg8cD417291n9vSrUwlrvN8CKiL/0Qsa7Ntti6pbzwWDAHpneN4E06t32z",
        `${officeId}#${outputDate}#${offset + 1}#${PAGE_SIZE}`
      );

      if (response.decrypted.data.Result[0]) {
        const parsed = JSON.parse(
          response.decrypted.data.Result[0].ZakatFitrOfficeOutputItemsData || "[]"
        );

        setOutFitrData(parsed);
        setTotalRows(
          Number(
            response.decrypted.data.Result[0]
              .ZakatFitrOfficeOutputItemsCount || 0
          )
        );
      } else {
        setOutFitrData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setOutFitrData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, outputDate]);

  // ========================
  // Columns
  // ========================
  const columns = [
    {
      key: "Id",
      header: "رقم العملية",
      render: (r) => r.Id,
      width: "100px",
    },
    {
      key: "OutDate",
      header: "تاريخ الصرف",
      render: (r) => new Date(r.OutDate).toLocaleString(),
    },
    {
      key: "actions",
      header: "تفاصيل",
      render: (r) => (
        <SharedButton
          variant="brandOutline"
          size="sm"
          onClick={() =>
            navigate(`/officedashboard/fitrOutput/details/${r.Id}`)
          }
        >
          عرض التفاصيل
        </SharedButton>
      ),
    },
  ];

  // ========================
  // Handlers
  // ========================
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      const formatted = date
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");

      setOutputDate(formatted);
      setPage(1);
    }
  };

  const getInputDateValue = () => {
    const [month, day, year] = outputDate.split("-");
    return `${year}-${month}-${day}`;
  };

  // ========================
  // UI
  // ========================
  return (
    <Box>
      {/* Header */}
      <HStack spacing={3} mb={4} justify="space-between">
        <HStack spacing={3}>
          <Box>
            <Text fontSize="sm" mb={1} color="gray.600">
              تاريخ الصرف
            </Text>
            <Input
              type="date"
              value={getInputDateValue()}
              onChange={handleDateChange}
              width="200px"
              size="sm"
            />
          </Box>
        </HStack>

        <SharedButton
          variant="brandGradient"
          onClick={() => navigate("/officedashboard/OutFitrZakat")}
        >
          إضافة صرف جديد
        </SharedButton>
      </HStack>

      {/* Loading */}
      {loading && (
        <Box mt={10} textAlign="center">
          <Spinner size="xl" />
        </Box>
      )}

      {/* Table */}
      {!loading && outFitrData.length > 0 && (
        <DataTable
          title="سجل صرف زكاة الفطر"
          data={outFitrData}
          columns={columns}
          totalRows={totalRows}
          page={page}
          startIndex={offset + 1}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Empty State */}
      {!loading && outFitrData.length === 0 && (
        <Text
          mt={10}
          fontSize="lg"
          color="gray.500"
          textAlign="center"
        >
          لا توجد عمليات صرف في هذا التاريخ
        </Text>
      )}
    </Box>
  );
};

export default OutFitrTable;
