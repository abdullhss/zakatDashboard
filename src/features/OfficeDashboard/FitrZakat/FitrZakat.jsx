import { Box, HStack, Text } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import { getSession } from "../../../session";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { executeProcedure } from "../../../api/apiClient";

const PAGE_SIZE = 100;

const FitrZakat = () => {
  const { officeId } = getSession();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [ZakatFitrData, setZakatFitrData] = useState([]);
  const [loading, setLoading] = useState(true);

  const offset = (page - 1) * PAGE_SIZE;

  useEffect(() => {
    const GetZakatFitrItemsData = async () => {
      const response = await executeProcedure(
        "jkE/EfUyfEzbwqK/HolgChI5O++hElNV6y+iDEMHKxo=",
        `${officeId}#${offset + 1}#${PAGE_SIZE}`
      );

      const parsed = JSON.parse(response.decrypted.data.Result[0].ZakatFitrItemsData);
      setZakatFitrData(parsed);
      setLoading(false);
    };

    GetZakatFitrItemsData();
  }, []);

  const columns = [
    // { key: "Id", header: "ID", render: (r) => r.Id },
    { key: "ItemName", header: "اسم الصنف", render: (r) => r.ItemName },
    { key: "ItemValue", header: "قيمة الفطرة", render: (r) => r.ItemValue },
  ];

  return (
    <Box>
      <DataTable
        title="أصناف زكاة الفطر"
        data={ZakatFitrData}
        columns={columns}
        // totalRows={1} // ثابت زي ما طلبت
        loading={loading}
        // page={page}
        // startIndex={offset + 1}
        // pageSize={PAGE_SIZE}
        // onPageChange={setPage}
        headerAction={
          <HStack spacing={3}>
            <SharedButton
              variant="brandGradient"
              onClick={() => navigate("/officedashboard/fitrZakat/add")}
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
