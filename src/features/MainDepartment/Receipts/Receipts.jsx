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
import { useGetSubventionTypes } from "../Subvention/hooks/useGetubventionTypes";

const PAGE_LIMIT = 10;

const Payments = () => {
  const userId = getCurrentUserId();

  const [selectedOffice, setSelectedOffice] = useState(0);
  const [selectedSubventionTypeId, setSelectedSubventionTypeId] = useState(0);
  const [selectedProject_Id, setSelectedProject_Id] = useState(0);
  const [projects, setProjects] = useState([]);

  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [PaymentsData, setPaymentsData] = useState([]);
  const [PaymentsCount, setPaymentsCount] = useState(0);
  const [page, setPage] = useState(1);

  /** -------------------- GET OFFICES ------------------- */
  const { data: officesData, isLoading: officesLoading } = useGetOffices(
    1,
    10000,
    userId
  );

  /** -------------------- GET SUBVENTIONS ------------------- */
  const { data: subventionsData, isLoading: subventionsLoading } =
    useGetSubventionTypes(0, 1000);

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
    const params = `${selectedOffice}#${selectedSubventionTypeId}#${selectedProject_Id}#${selectedFromDate}#${selectedToDate}#${(page - 1) * PAGE_LIMIT + 1}#${PAGE_LIMIT}`;

    const response = await executeProcedure(
      "nMzFI8XoIbwxjuKdXGFF0YViCloApN9Mz74pViz7qf0=",
      params
    );

    setPaymentsCount(Number(response.decrypted.data?.Result[0].PaymentsCount));
    setPaymentsData(
      JSON.parse(response.decrypted.data?.Result[0].PaymentsData)
    );
  };

  /** Fetch when page changes */
  useEffect(() => {
    fetchPayments();
  }, [page]);

  /** DataTable Columns */
  const columns = [
    // { header: "رقم العملية", render: (row) => row.Id },
    {
      header: "التاريخ",
      render: (row) => row.PaymentDate?.split("T")[0],
      sortable: true,
    },
    { header: "بيان الدفع", render: (row) => row.PaymentDesc || "-" },
    { header: "القيمة", render: (row) => row.PaymentValue},
    { header: "نوع العملية", render: (row) => row.ActionName || "-" },
    { header: "نوع الإعانة", render: (row) => row.SubventionTypeName || "-" },
    { header: "المشروع", render: (row) => row.ProjectName || "-" },
    { header: "المكتب", render: (row) => row.OfficeName || "-" },
    { header: "البنك", render: (row) => row.BankName || "-" },
    { header: "اسم المستخدم", render: (row) => row.UserName || "-" },
    { header: "رقم الحساب", render: (row) => row.AccountNum || "-" },
  ];

  return (
    <Box p={5}>
      {/* Filters */}
      <VStack spacing={4} align="stretch">

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>

          {/* المكتب */}
          <Box>
            <Text mb={1}>اختر المكتب</Text>
            {officesLoading ? (
              <Spinner />
            ) : (
              <Select
                placeholder="اختر المكتب"
                value={selectedOffice}
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
                onChange={(e) =>
                  setSelectedSubventionTypeId(e.target.value || 0)
                }
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
        </SimpleGrid>

        <Button
          colorScheme="blue"
          onClick={() => {
            setPage(1);
            fetchPayments();
          }}
        >
          بحث
        </Button>
      </VStack>

      {/* DataTable */}
      <Box mt={8}>
        <DataTable
          title="المصروفات"
          columns={columns}
          data={PaymentsData}
          page={page}
          pageSize={PAGE_LIMIT}
          onPageChange={setPage}
          totalRows={PaymentsCount}
          startIndex={(page - 1) * PAGE_LIMIT + 1}
        />
      </Box>
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
  } catch {}
  return 1;
}
