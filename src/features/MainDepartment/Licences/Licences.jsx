import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Heading,
  Spinner,
  Flex,
  Text,
  Button,
  useToast,
} from "@chakra-ui/react";

import { doTransaction, executeProcedure } from "../../../api/apiClient";
import DataTable from "../../../Components/Table/DataTable";
import Pagination from "../../../Components/Table/Pagination";

const Licences = () => {
  const toast = useToast();
  const [statusPage, setStatusPage] = useState("True");
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const userId = JSON.parse(localStorage.getItem("userId")) || {};
  const userIdVal = typeof userId === "object" && userId !== null ? (userId.id ?? userId.Id ?? userId) : userId;
  
  const pageSize = 10;
  const [page, setPage] = useState(1);

  const start = (page - 1) * pageSize + 1;

  const getLicenceData = async () => {
    try {
      setLoading(true);

      const response = await executeProcedure(
        "lxJ8BlIes5x3kLoiYHBC/prMupoAvaHwRyeGwfhxCBo=",
        `${statusPage}#${start}#${pageSize}`
      );

      const totalCount = Number(
        response?.decrypted?.data?.Result?.[0]?.DevicesCount || 0
      );

      const result =
        response?.decrypted?.data?.Result?.[0]?.DevicesData || "[]";

      const parsed = JSON.parse(result);

      setData(parsed);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error fetching licences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLicenceData();
  }, [statusPage, page]);

  const columns = [
    {
      key: "OfficeName",
      header: "اسم المكتب",
      render: (row) =>
        row.Office_Id === 0 ? <span style={{textWrap:"nowrap"}}>{"حساب ادارة"}</span> : <span style={{textWrap:"nowrap"}}>{row.OfficeName}</span> || "—",
    },
    {
      key: "UserName",
      header: "اسم المستخدم",
      render: (row) => <span>{row.UserName}</span> || "—",
    },
    {
      key: "RequireDate",
      header: "تاريخ الطلب",
      render: (row) =>
        row.RequireDate
          ? new Date(row.RequireDate).toLocaleDateString("en-GB")
          : "—",
    },
    {
      key: "SerialNum",
      header: "الرقم التسلسلي",
      render: (row) => <span style={{textWrap:"nowrap"}}>{row.SerialNum}</span> || "—",
    },
  ];

  const TableContent = () => {
    if (loading) {
      return (
        <Flex justify="center" p={10}>
          <Spinner size="lg" />
        </Flex>
      );
    }

    if (!data.length) {
      return (
        <Text textAlign="center" color="gray.500">
          لا توجد بيانات
        </Text>
      );
    }

    return (
      <>
        <DataTable
          data={data}
          columns={columns}
          viewHashTag={false}
          renderActions={(row) => (
            <Button
              size="sm"
              colorScheme={statusPage === "True" ? "red" : "green"}
              onClick={() => handleChangeStatus(row)}
              isLoading={
                actionLoadingId === (row.Id ?? row.DeviceId ?? row.SerialNum)
              }
              loadingText="..."
            >
              {statusPage === "True" ? "إلغاء الترخيص" : "ترخيص"}
            </Button>
          )}
        />

        <Flex justify="center" mt={4}>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={setPage}
            maxVisible={5}
          />
        </Flex>
      </>
    );
  };

  const handleChangeStatus = async (row) => {
    const id = row.Id ?? row.DeviceId ?? row.SerialNum;
    if (id == null || id === "") return;
    setActionLoadingId(id);
    try {
      const response = await doTransaction({
        TableName: "NrL4IXCbkoMalPVS/9TGbw==",
        WantedAction: 1,
        ColumnsValues: `${id}#${statusPage === "True" ? "False" : "True"}#default#${userIdVal}`,
        ColumnsNames: "Id#Allowed#AllowDate#AllowBy",
      });
      console.log(response);
      
      const result = response?.decrypted?.data?.Result?.[0];
      const success = result?.Success ?? result?.success ?? true;
      toast({
        title: success ? "تمت العملية بنجاح" : "فشلت العملية",
        description: success
          ? statusPage === "True"
            ? "تم إلغاء الترخيص"
            : "تم منح الترخيص"
          : result?.Message ?? result?.message ?? "حدث خطأ",
        status: success ? "success" : "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      if (success) await getLicenceData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: error?.message ?? "حدث خطأ أثناء تنفيذ العملية",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setActionLoadingId(null);
    }
  };
  return (
    <Box p={6} dir="rtl">
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">إدارة التراخيص</Heading>

        <Tabs
          variant="enclosed"
          onChange={(index) => {
            setPage(1);
            setStatusPage(index === 0 ? "True" : "False");
          }}
        >
          <TabList>
            <Tab>الأجهزة المرخصة</Tab>
            <Tab>الأجهزة غير المرخصة</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <TableContent />
            </TabPanel>

            <TabPanel>
              <TableContent />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Licences;