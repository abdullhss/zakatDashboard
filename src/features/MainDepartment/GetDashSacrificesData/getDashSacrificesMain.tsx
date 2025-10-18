import React, { useState, useMemo } from 'react';
import { Box, Flex, Spinner, Alert, AlertIcon, Text, Select, HStack, Switch } from '@chakra-ui/react';
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetSacrificesDashData } from '../../OfficeDashboard/SacrificesData/hooks/useGetSacrificeData'; 
import { useGetOffices } from '../Offices/hooks/useGetOffices'; // هوك جلب المكاتب

const PAGE_SIZE = 10;

// ===================================
// 1. تعريف الأعمدة
// ===================================

const SACRIFICES_COLUMNS: Column[] = [
  {
    key: "ApplicantName", 
    header: "اسم مقدم الطلب",
    width: "25%",
    render: (row: AnyRec) => row.UserName ?? row.ApplicantName ?? `مستخدم رقم ${row.GeneralUser_Id}` ?? '—',
  },
  {
    key: "OfficeName", 
    header: "المكتب",
    width: "20%",
    render: (row: AnyRec) => row.OfficeName ?? '—',
  },
  {
    key: "SacrificeOrderDate", 
    header: "تاريخ الطلب",
    width: "15%",
    render: (row: AnyRec) => {
      const raw = row.SacrificeOrderDate || row.CreatedDate;
      if (!raw) return '—';

      const s = String(raw);

      // ISO مثل 2025-10-14T00:00:00
      if (s.includes('-')) {
        const d = new Date(s);
        if (!Number.isNaN(+d)) {
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          return `${dd}/${mm}/${yyyy}`;
        }
      }

      //Fallback للشكل المتسلسل yyyymmdd
      if (s.length >= 8) {
        const year = s.substring(0, 4);
        const month = s.substring(4, 6);
        const day = s.substring(6, 8);
        return `${day}/${month}/${year}`;
      }

      return '—';
    },
  },
  {
    key: "SacrificeTotalAmount", 
    header: "الإجمالي",
    width: "15%",
    render: (row: AnyRec) => {
      const amount = row.SacrificeTotalAmount ?? row.TotalAmount ?? '0';
      return <Text fontWeight="600">{amount} د.ل.</Text>;
    },
  },
  {
    key: "IsApproved", 
    header: "حالة الطلب",
    width: "15%",
    render: (row: AnyRec) => {
      const isApproved = row.IsApproved === true || String(row.IsApproved).toLowerCase() === 'true';
      return (
        <HStack spacing={3}>
          <Switch 
            isChecked={isApproved} 
            isReadOnly 
            size="sm"
            colorScheme={isApproved ? "green" : "red"}
          />
          <Text as="span" color="gray.600">
            {isApproved ? "مقبول" : "مرفوض"}
          </Text>
        </HStack>
      );
    },
  },
];

// ===================================
// 2. مكون عرض البيانات
// ===================================

export default function GetSacrificeDataMain() {
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  // حالة التصفية للحالة (0=الكل، 1=مقبول، 2=مرفوض)
  const [selectedStatus, setSelectedStatus] = useState<number>(0); 
  // حالة فلتر المكاتب (0 = الكل)
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | number>(0); 

  // جلب المكاتب
  const { data: officesData, isLoading: isOfficesLoading, isError: isOfficesError } = useGetOffices(0, 100); 

  // جلب بيانات الأضاحي بناءً على المكتب المُختار
  const { data, isLoading, isError, error, isFetching } = useGetSacrificesDashData(
    selectedOfficeId, // ✅ يتم تمرير المكتب الآن بشكل صحيح
    offset, 
    limit
  ); 

  const rows = data?.rows ?? [];
  const totalRows = data?.totalRows ?? 0;

  // تحويل بيانات المكاتب للعرض (لإصلاح مشكلة العرض)
  const officesOptions = useMemo(() => {
    return (officesData?.rows ?? []).map((office: AnyRec) => ({
      id: String(office.id ?? office.Office_Id ?? 0), 
      name: office.companyName ?? office.OfficeName ?? office.Name, 
    })).filter(o => o.name); 
  }, [officesData?.rows]);

  // منطق التصفية المحلية للحالة (ضروري)
  const filteredRows = useMemo(() => {
    let currentRows = rows;
    
    if (selectedStatus !== 0) {
      const statusTarget = selectedStatus === 1; // 1: مقبول
      
      currentRows = currentRows.filter(row => {
        const isApproved = row.IsApproved === true || String(row.IsApproved).toLowerCase() === 'true';
        return isApproved === statusTarget;
      });
    }
    return currentRows;
  }, [rows, selectedStatus]);


  if (isLoading || isOfficesLoading || isFetching) {
    return (
      <Flex justify="center" p={10}><Spinner size="xl" /></Flex>
    );
  }

  if (isError || isOfficesError) {
    return (
      <Alert status='error' m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب البيانات: {(error as Error)?.message || "خطأ في جلب بيانات المكاتب."}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <HStack mb={4} spacing={3}>
        {/* فلتر حالة الطلب */}

        {/* فلتر المكاتب */}
        <Select
          w="260px"
          value={selectedOfficeId}
          onChange={(e) => {
            setPage(1); 
            setSelectedOfficeId(e.target.value);
          }}
          isDisabled={isOfficesLoading || isOfficesError}
        >
          <option value={0}>جميع المكاتب</option> 
          {officesOptions.map((office) => (
            <option key={office.id} value={office.id}>
              {office.name}
            </option>
          ))}
        </Select>
      </HStack>

      <DataTable
        title="مراجعة بيانات الأضاحي"
        data={filteredRows as unknown as AnyRec[]}
        columns={SACRIFICES_COLUMNS}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        totalRows={totalRows}
      />
      
      {filteredRows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">
          لا توجد طلبات أضاحي حاليًا.
        </Text>
      )}
    </Box>
  );
}
