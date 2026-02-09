import { Box, HStack, Text, useToast } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import { getSession } from "../../../session";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { executeProcedure, doTransaction } from "../../../api/apiClient";

const PAGE_SIZE = 100;

const FitrZakat = () => {
  const { officeId } = getSession();
  const navigate = useNavigate();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [ZakatFitrData, setZakatFitrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const offset = (page - 1) * PAGE_SIZE;

  const fetchData = async () => {
    try {
      const response = await executeProcedure(
        "COuyA9fV1VjMChl9vOK7uw5Uqlu2P7l5ey7zJtWBrXw=",
        `${offset + 1}#${PAGE_SIZE}`
      );
      console.log(response);
      const parsed = JSON.parse(response.decrypted.data.Result[0].ZakatFitrMainItemsData);
      setZakatFitrData(parsed);
      setTotalRows(Number(response.decrypted.data.Result[0].ZakatFitrMainItemsCount));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const columns = [
    { key: "ItemName", header: "اسم الصنف", render: (r) => r.ItemName },
  ];

  const handleEdit = (row) => {
    // Navigate to edit page with item ID
    navigate(`/maindashboard/fitrZakatTypes/edit/${row.Id}`, {
      state: { itemData: row } // Pass item data via state
    });
  };

  const handleDelete = async (row) => {
      try {
        const deleteResp = await doTransaction({
          TableName: "SUQrRj4aXGHZtVxaBhnjKB2OdFiLPDGrwFteGIRYxZU=",
          ColumnsNames: "Id", // Only ID for delete
          ColumnsValues: row.Id, // The ID to delete
          PointId: 0,
          WantedAction: 2, // Delete action
        });

        if (deleteResp.decrypted.result == 200) {
          toast({
            title: "تم الحذف",
            description: "تم حذف الصنف بنجاح",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          
          // Refresh data after delete
          fetchData();
        } else {
          throw new Error("فشل في الحذف");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "خطأ",
          description: "فشل في حذف الصنف",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
  };

  return (
    <Box>
      <DataTable
        title="أصناف زكاة الفطر"
        data={ZakatFitrData}
        columns={columns}
        totalRows={totalRows}
        loading={loading}
        page={page}
        startIndex={offset + 1}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEditRow={handleEdit}
        onDeleteRow={handleDelete}
        headerAction={
          <HStack spacing={3}>
            <SharedButton
              variant="brandGradient"
              onClick={() => navigate("/maindashboard/fitrZakatTypes/add")}
            >
              إضافة صنف
            </SharedButton>
          </HStack>
        }
      />

      {!loading && (!ZakatFitrData || ZakatFitrData.length === 0) && (
        <Text mt={3} color="gray.500">
          لا توجد بيانات.
        </Text>
      )}
    </Box>
  );
};

export default FitrZakat;