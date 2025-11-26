import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  useToast,
  HStack,
  Select,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { DataTable } from "../../../Components/Table/DataTable";
import { executeProcedure } from "../../../api/apiClient";
import { useGetOffices } from "../Offices/hooks/useGetOffices";

const PAGE_SIZE = 10;

const useOfficeOptions = (rows?: any[]) =>{
  const opts = [
    { id: 0, name: "كل المكاتب" },
    ...(rows ?? []).map((r: any) => ({
      id: r.id ?? r.Id,
      name: r.companyName ?? r.OfficeName ?? `مكتب #${r.id ?? r.Id}`,
    })),
  ];
  const nameById = new Map<string | number, string>();
  opts.forEach((o) => nameById.set(o.id, o.name));
  return { officeOptions: opts, officeNameById: nameById };
}

function toApiDate(d) {
  if (!d) return "";
  const date = new Date(d);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`; // MM/dd/yyyy
}

export default function GetSacrificeDataMain() {
  const toast = useToast();
  const role = localStorage.getItem("role");

  // ------------------------------
  // الفلاتر
  // ------------------------------
  const [selectedOffice, setSelectedOffice] = useState(0);
  const [status, setStatus] = useState(0); // 0: كل الحالات
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");

  // ------------------------------
  // Pagination
  // ------------------------------
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;

  // ------------------------------
  // تحميل مكاتب
  // ------------------------------
  const { data: officesData } = useGetOffices(0, 200);
  const { officeOptions } = useOfficeOptions(officesData?.rows);

  // ------------------------------
  // جلب بيانات الأضاحي
  // ------------------------------
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const response = await executeProcedure(
        "0uavRCQZEvGYBEMJr34KpKX6qzTSADP07IHXzBH6xgk=",
        `${selectedOffice}#${status}#${fromdate}#${todate}#${offset + 1}#${limit}`
      );
      console.log(response);
      
      try {
        const result = response.decrypted.data.Result[0];
        const parsed = JSON.parse(result.SacrificesData);
        setRows(parsed || []);
        setTotalRows(Number(result.SacrificesCount));
      } catch (e) {
        toast({ status: "error", title: "خطأ أثناء جلب البيانات" });
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedOffice, status, fromdate, todate, page]);

  // ------------------------------
  // الأعمدة
  // ------------------------------
  const COLUMNS = useMemo(() => {
    const base = [
      { key: "UserName", header: "اسم مقدم الطلب" },
      { key: "OfficeName", header: "المكتب" },
      { key: "SacrificeOrderDate", header: "تاريخ الطلب" },
      { key: "TotalAmount", header: "الإجمالي" },
    ];

    if (role === "O") {
      base.push({
        key: "__actions",
        header: "الإجراء",
        render: () => <span>Actions Here</span>,
      });
    } else {
      base.push({
        key: "Status",
        header: "الحالة",
      });
    }

    return base;
  }, [role]);

  // ------------------------------
  // Render
  // ------------------------------
console.log(officeOptions);

  return (
    <Box p={6}>

{/* ✅ الفلاتر */}
<HStack mb={5} spacing={4} alignItems="flex-end">

  {/* مكتب */}
  <FormControl maxW="200px">
    <FormLabel fontSize="sm">المكتب</FormLabel>
    <Select
      padding={"0px 10px"}
      placeholder="اختر المكتب"
      value={selectedOffice}
      onChange={(e) => {
        setSelectedOffice(Number(e.target.value));
        setPage(1);
      }}
    >
      <option value={0}>كل المكاتب</option>
      {officeOptions.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </Select>
  </FormControl>

  {/* الحالة */}
  <FormControl maxW="200px">
    <FormLabel fontSize="sm">الحالة</FormLabel>
    <Select
      padding={"0px 10px"}
      value={status}
      onChange={(e) => {
        setStatus(Number(e.target.value));
        setPage(1);
      }}
    >
      <option value={0}>كل الحالات</option>
      <option value={1}>مقبول</option>
      <option value={2}>مرفوض</option>
    </Select>
  </FormControl>

  {/* التاريخ من */}
  <FormControl maxW="200px">
    <FormLabel fontSize="sm">التاريخ من</FormLabel>
    <Input
      type="date"
      onChange={(e) => {
        setFromdate(toApiDate(e.target.value));
        setPage(1);
      }}
    />
  </FormControl>

  {/* التاريخ إلى */}
  <FormControl maxW="200px">
    <FormLabel fontSize="sm">التاريخ إلى</FormLabel>
    <Input
      type="date"
      onChange={(e) => {
        setTodate(toApiDate(e.target.value));
        setPage(1);
      }}
    />
  </FormControl>

</HStack>

      {/* Loader */}
      {(loading && rows.length === 0) && (
        <Flex justify="center" p={10}>
          <Spinner size="xl" />
        </Flex>
      )}

      {/* Table */}
      {!loading && (
        <DataTable
          title="طلبات الأضاحي"
          data={rows}
          columns={COLUMNS}
          startIndex={offset + 1}
          page={page}
          pageSize={limit}
          totalRows={totalRows}
          onPageChange={setPage}
        />
      )}

      {!loading && rows.length === 0 && (
        <Text mt={3} color="gray.500">
          لا توجد بيانات.
        </Text>
      )}
    </Box>
  );
}
