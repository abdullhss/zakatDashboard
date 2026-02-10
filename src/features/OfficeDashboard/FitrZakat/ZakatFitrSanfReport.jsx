import React, { useEffect, useState } from "react";
import {
  Box,
  Spinner,
  Text,
  Button,
} from "@chakra-ui/react";
import { executeProcedure } from "../../../api/apiClient";
import { DataTable } from "../../../Components/Table/DataTable";

const PAGE_LIMIT = 10;

const ZakatFitrSanfReport = () => {
  const mainUserData = localStorage.getItem("mainUser");
  const OfficeId = mainUserData ? JSON.parse(mainUserData).Office_Id : 0;

  const [itemsData, setItemsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // ========================
  // Columns
  // ========================
  const ITEMS_COLUMNS = [
    {
      key: "ItemName",
      header: "اسم الصنف",
      render: (row) => row.ItemName || "-",
    },
    {
      key: "InQty",
      header: "الكمية الداخلة",
      render: (row) => row.InQty ?? 0,
    },
    {
      key: "OutQty",
      header: "الكمية الخارجة",
      render: (row) => row.OutQty ?? 0,
    },
    {
      key: "OrderQty",
      header: "الكمية المطلوبة",
      render: (row) => row.OrderQty ?? 0,
    },
  ];

  // ========================
  // Fetch Data
  // ========================
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await executeProcedure(
        "jkE/EfUyfEzbwqK/HolgCgbuZHEL13/rRdUgr6M0Qxk=",
        `${OfficeId}`
      );

      setItemsData(
        response.decrypted.data?.Result[0].ZakatFitrItemsData
          ? JSON.parse(response.decrypted.data.Result[0].ZakatFitrItemsData)
          : []
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  // ========================
  // UI
  // ========================
  return (
    <Box p={5}>
      {loading ? (
        <Box mt={10} display="flex" justifyContent="center">
          <Spinner size="xl" />
        </Box>
      ) : itemsData.length > 0 ? (
        <Box mt={6}>
          <DataTable
            title="تقرير أصناف زكاة الفطر"
            data={itemsData}
            columns={ITEMS_COLUMNS}
            page={page}
            pageSize={PAGE_LIMIT}
            onPageChange={setPage}
            totalRows={itemsData.length}
            startIndex={(page - 1) * PAGE_LIMIT + 1}
          />
{/* 
          <Button mt={4} w="full" onClick={() => window.print()}>
            طباعة
          </Button> */}
        </Box>
      ) : (
        <Text fontSize="20px" textAlign="center">
          لا توجد بيانات
        </Text>
      )}
    </Box>
  );
};

export default ZakatFitrSanfReport;
