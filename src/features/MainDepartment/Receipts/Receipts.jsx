import React, { useEffect, useState } from 'react'
import {
  Select,
  Input,
  Box,
  VStack,
  Text,
  Spinner,
  Button
} from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
} from "@chakra-ui/react";

import { executeProcedure, PROCEDURE_NAMES } from "../../../api/apiClient";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useGetSubventionTypes } from "../Subvention/hooks/useGetubventionTypes";


const PAGE_LIMIT = 10 
const Payments = () => {

  const userId = getCurrentUserId();

  const [selectedOffice, setSelectedOffice] = useState(0);
  const [selectedSubventionTypeId, setSelectedSubventionTypeId] = useState(0);
  const [selectedProject_Id, setSelectedProject_Id] = useState(0);
  const [projects, setProjects] = useState([]);

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [PaymentsData , setPaymentsData] = useState([])
  const [PaymentsCount , setPaymentsCount] = useState(0)
  const [page, setPage] = useState(1)

  /** -------------------- GET OFFICES ------------------- */
  const {
    data: officesData,
    isLoading: officesLoading,
  } = useGetOffices(1, 10000, userId);

  /** -------------------- GET SUBVENTIONS ------------------- */
  const {
    data: subventionsData,
    isLoading: subventionsLoading,
  } = useGetSubventionTypes(0, 1000);


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
    console.log(page);
    console.log((page-1)*PAGE_LIMIT + 1);
    
    const params = `${selectedOffice}#${selectedSubventionTypeId}#${selectedProject_Id}#${selectedFromDate}#${selectedToDate}#${(page-1)*PAGE_LIMIT + 1}#${PAGE_LIMIT}`;

    const response = await executeProcedure(
      "nMzFI8XoIbwxjuKdXGFF0YViCloApN9Mz74pViz7qf0=",
      params
    );
    console.log(response.decrypted.data?.Result[0]);
    
    setPaymentsCount(Number(response.decrypted.data?.Result[0].PaymentsCount))
    setPaymentsData(JSON.parse(response.decrypted.data?.Result[0].PaymentsData))
  };
  useEffect(() => {
    fetchPayments();
  }, [page]);


  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">

        {/* مكتب */}
        <Box>
          <Text mb={1}>اختر المكتب</Text>
          {officesLoading ? (
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
          )}
        </Box>

        {/* الإعانة */}
        <Box>
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

        {/* التاريخ من */}
        <Box>
          <Text mb={1}>من تاريخ</Text>
          <Input
            type="date"
            value={selectedFromDate}
            onChange={(e) => setSelectedFromDate(e.target.value)}
          />
        </Box>

        {/* التاريخ إلى */}
        <Box>
          <Text mb={1}>إلى تاريخ</Text>
          <Input
            type="date"
            value={selectedToDate}
            onChange={(e) => setSelectedToDate(e.target.value)}
          />
        </Box>

        <Button   onClick={() => {
    setPage(1);
    fetchPayments();
  }}>
          بحث
        </Button>

      </VStack>
        {PaymentsData.length > 0 && (
            <TableContainer
                mt={6}
                border="1px solid #e2e8f0"
                borderRadius="12px"
                maxW="100%"
            >
                <Table variant="simple" size="lg">
                <Thead bg="gray.200">
                    <Tr>
                    <Th fontSize="md" py={4}>رقم العملية</Th>
                    <Th fontSize="md" py={4}>التاريخ</Th>
                    <Th fontSize="md" py={4}>بيان الدفع</Th>
                    <Th fontSize="md" py={4}>القيمة</Th>
                    <Th fontSize="md" py={4}>نوع العملية</Th>
                    <Th fontSize="md" py={4}>نوع الإعانة</Th>
                    <Th fontSize="md" py={4}>المشروع</Th>
                    <Th fontSize="md" py={4}>المكتب</Th>
                    <Th fontSize="md" py={4}>البنك</Th>
                    <Th fontSize="md" py={4}>اسم المستخدم</Th>
                    <Th fontSize="md" py={4}>رقم الحساب</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {PaymentsData.map((p) => (
                    <Tr
                        key={p.Id}
                        _hover={{ bg: "gray.50" }}
                        fontSize="md"
                        height="60px"
                    >
                        <Td>{p.Id}</Td>
                        <Td>{p.PaymentDate?.split("T")[0]}</Td>
                        <Td>{p.PaymentDesc || "-"}</Td>
                        <Td fontWeight="bold">{p.PaymentValue}</Td>
                        <Td>{p.ActionName || "-"}</Td>
                        <Td>{p.SubventionTypeName || "-"}</Td>
                        <Td>{p.ProjectName || "-"}</Td>
                        <Td>{p.OfficeName || "-"}</Td>
                        <Td>{p.BankName || "-"}</Td>
                        <Td>{p.UserName || "-"}</Td>
                        <Td>{p.AccountNum || "-"}</Td>
                    </Tr>
                    ))}
                </Tbody>
                </Table>
            </TableContainer>
            )}


    {PaymentsCount > PAGE_LIMIT && (
  <HStack mt={4} spacing={4} justify="center">
<Button
  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
  isDisabled={page === 1}
>
  السابق
</Button>

<Text>صفحة {page} من {Math.ceil(PaymentsCount / PAGE_LIMIT)}</Text>

<Button
  onClick={() =>
    setPage((prev) =>
      prev < Math.ceil(PaymentsCount / PAGE_LIMIT)
        ? prev + 1
        : prev
    )
  }
  isDisabled={page >= Math.ceil(PaymentsCount / PAGE_LIMIT)}
>
  التالي
</Button>

  </HStack>
)}


    </Box>
  );
};

export default Payments;

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
  } catch { }
  return 1;
}
