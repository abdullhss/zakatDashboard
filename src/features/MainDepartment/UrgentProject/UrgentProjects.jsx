import { useMemo, useRef, useState, useEffect } from "react";
import {
  Box, Text, HStack, useDisclosure, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, IconButton, Menu,
  MenuButton, MenuList, MenuItem, Portal, Flex, Spinner, Alert, AlertIcon, Button,
  Switch
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

import { DataTable } from "../../../Components/Table/DataTable";
import { doTransaction, executeProcedure } from "../../../api/apiClient";
import { getSession } from "../../../session";

/* ---------------- Main Component ---------------- */
export default function UrgentProjects() {
  const navigate = useNavigate();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState("");

  console.log(data);
  
  const fetchUrgent = async () => {
    try {
      setIsLoading(true);

      const response = await executeProcedure(
        "VhHmn+1EDh7y7eor+QB6x6Sr9C8GNNtWwSOKT9ErVP4=",
        `0#${page}#${limit}`
      );

      setTotalRows(Number(response.decrypted.data.Result[0].ProjectsCount));
      setData(JSON.parse(response.decrypted.data.Result[0].ProjectsData));
      setServerMessage(response.message || "");
    } catch (err) {
      toast({
        title: "خطأ أثناء تحميل المشاريع",
        description: err.message,
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgent();
  }, [page]);

    const rows = useMemo(() => {
    return data.map((r) => ({
        Id: Number(r.Id),
        Name: r.Name ?? "—",
        SubventionTypeName: r.SubventionTypeName ?? "—",
        OfficeName: r.OfficeName ?? "—",
        WantedAmount: r.WantedAmount ?? 0,
        RemainingAmount: r.RemainingAmount ?? 0,
        AllowZakat: Boolean(r.AllowZakat),
        IsActive: Boolean(r.IsActive),
        ViewInMainScreen: Boolean(r.ViewInMainScreen),
    }));
    }, [data]);

    const columns = useMemo(
    () => [
        {
        key: "Name",
        header: "اسم المشروع",
        render: (row) => <Text fontWeight="600">{row.Name}</Text>,
        },
        {
        key: "SubventionTypeName",
        header: "نوع الإعانة",
        },
        {
        key: "OfficeName",
        header: "المكتب",
        },
        {
        key: "WantedAmount",
        header: "المبلغ المطلوب",
        render: (row) => row.WantedAmount?.toLocaleString() ?? "—",
        },
        {
        key: "RemainingAmount",
        header: "المبلغ المتبقي",
        render: (row) => row.RemainingAmount?.toLocaleString() ?? "—",
        },
        {
        key: "AllowZakat",
        header: "يُسمح بالزكاة",
        render: (row) => (
            <Text color={row.AllowZakat ? "green.500" : "red.500"}>
            {row.AllowZakat ? "نعم" : "لا"}
            </Text>
        ),
        },
        {
        key: "IsActive",
        header: "مفعل",
        render: (row) => (
            <Text color={row.IsActive ? "green.500" : "red.500"}>
            {row.IsActive ? "نعم" : "لا"}
            </Text>
        ),
        },
        {
        key: "ViewInMainScreen",
        header: "العرض في الرئيسية",
        render: (row) => { console.log(row);
         return(
            <Switch defaultChecked={row.ViewInMainScreen} onChange={()=>{changeViewInMainScreen(row)}}></Switch>
        )},
        },
    ],
    []
    );

    const changeViewInMainScreen = async (row) => {
            const columnsNames ="Id#ViewInMainScreen";
            const columnsValues =
            `${row.Id}#${row.ViewInMainScreen ? "False" : "True"}`;
            const { userId, officeId } = getSession();
            const pointId = userId ?? 0;

            const exec = await doTransaction({
                TableName: "w8GZW8O/lAQVG6R99L1C/w==",
                WantedAction: 1, // Update
                ColumnsValues: columnsValues,
                ColumnsNames: columnsNames,
                PointId: pointId,
            });

            console.log(exec);
            
    }

  if (isLoading) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      {serverMessage && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {serverMessage}
        </Alert>
      )}

      <DataTable
        title="المشاريع العاجلة"
        data={rows}
        columns={columns}
        onPageChange={setPage}
        page={page}
        pageSize={limit}
        totalRows={totalRows}
        startIndex={offset + 1}
      />
    </Box>
  );
}
