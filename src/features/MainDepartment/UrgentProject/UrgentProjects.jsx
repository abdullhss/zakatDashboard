import { useMemo, useRef, useState, useEffect } from "react";
import {
  Box, Text, HStack, useDisclosure, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, IconButton, Menu,
  MenuButton, MenuList, MenuItem, Portal, Flex, Spinner, Alert, AlertIcon, Button,
  Switch,
  Select
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

import { DataTable } from "../../../Components/Table/DataTable";
import { doTransaction, executeProcedure } from "../../../api/apiClient";
import { getSession } from "../../../session";
import { useGetSubventionTypes } from "../Subvention/hooks/useGetubventionTypes";
import { useGetOffices } from "../Offices/hooks/useGetOffices";

/* ---------------- Main Component ---------------- */
export default function UrgentProjects() {
  const navigate = useNavigate();
  const toast = useToast();


  
  const userId = getCurrentUserId(); 
  const role = localStorage.getItem("role");
  const officeName = localStorage.getItem("officeName")
  const mainUserData = localStorage.getItem("mainUser")
  const OfficeId = mainUserData?JSON.parse(mainUserData).Office_Id : 0 ;
  const [selectedOffice, setSelectedOffice] = useState(()=>{return(role=="O"? OfficeId : 0)});
  const [selectedSubventionTypeId, setSelectedSubventionTypeId] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState("");

  console.log(data);
    const { data: officesData, isLoading: officesLoading } = useGetOffices(
      1,
      10000
    );
  
    /** -------------------- GET SUBVENTIONS ------------------- */
    const { data: subventionsData, isLoading: subventionsLoading } =
      useGetSubventionTypes(0, 1000);
  
  const fetchUrgent = async () => {
    try {
      setIsLoading(true);

      const response = await executeProcedure(
        "VhHmn+1EDh7y7eor+QB6x6Sr9C8GNNtWwSOKT9ErVP4=",
        `${selectedOffice}#${selectedSubventionTypeId}#${page}#${limit}`
      );

      setTotalRows(Number(response.decrypted.data.Result[0].ProjectsCount));
      setData(response.decrypted.data.Result[0].ProjectsCount > 0 ? JSON.parse(response.decrypted.data.Result[0].ProjectsData) : []);
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
  }, [page , selectedOffice, selectedSubventionTypeId]);

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
        render: (row) => <Text fontWeight="600" minW={"130px"}>{row.OfficeName}</Text>,
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
      <Box>
        <HStack mb={5}>
          {/* مكتب */}
          <Box w={"full"}>
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
          {/* الإعانة */}
          <Box w={"full"}>
            <Text mb={1}>اختر الإعانة</Text>
            {subventionsLoading ? (
              <Spinner />
            ) : (
              <Select
                placeholder="اختر الإعانة"
                value={selectedSubventionTypeId}
                padding={3}
                onChange={(e) => setSelectedSubventionTypeId(e.target.value || 0)}
              >
                {subventionsData?.rows?.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.SubventionTypeName}
                  </option>
                ))}
              </Select>
            )}
          </Box>
        </HStack>
      </Box>
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
