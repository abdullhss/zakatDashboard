import React, { useState, useMemo } from 'react';
import { Box, Flex, Spinner, Alert, AlertIcon, Text, HStack, Button, Switch, Icon, useToast } from '@chakra-ui/react';
import { MdCheck, MdClose } from 'react-icons/md';  // استخدام الأيقونات للقبول والرفض
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetSacrificesDashData } from '../../OfficeDashboard/SacrificesData/hooks/useGetSacrificeData'; 
import { getOfficeIdForPayload } from '../../../session'; 
import { useUpdateSacrificesData } from './hooks/useUpdateSacrificesData'; 
import ActionButtons from "../../../Components/SharedButton/ActionButtons";

const PAGE_SIZE = 10;

// تنسيق التاريخ إلى dd/MM/yyyy
function formatApiDate(value: any): string {
  if (!value) return '—';

  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    const [y,m,d] = value.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  return '—';
}

type Row = {
  Id?: any;
  SacrificeOrderId?: any;
  OrderId?: any;
  SacrificeOrderDate?: any;
  Office_Id?: any;
  OfficeId?: any;
  GeneralUser_Id?: any;
  UserId?: any;
  SacrificeTotalAmount?: any;
  TotalAmount?: any;
  OfficeName?: string;
  ApplicantName?: string;
  UserName?: string;
  IsApproved?: any;
  IsDone?: any;
};

export default function SacrificeDataTypes() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const [selectedStatus, setSelectedStatus] = useState<number>(0); 

  const officeIdForAPI = getOfficeIdForPayload(); 

  const { data, isLoading, isError, error, isFetching } = useGetSacrificesDashData(
    officeIdForAPI, 
    offset, 
    limit
  ); 

  // ✅ استخدام تعريف واحد للـ rows و totalRows
  const allRows = (data?.rows ?? []) as Row[];
  const allTotalRows = data?.totalRows ?? allRows.length;
  
  const upd = useUpdateSacrificesData();

  const approveOrReject = async (r: Row, approve: boolean) => {
    const Id = r.Id ?? r.SacrificeOrderId ?? r.OrderId ?? r["id"];
    if (!Id) {
      toast({ status: "warning", title: "لا يمكن تحديد السجل", description: "المعرّف مفقود." });
      return;
    }
    try {
      await upd.mutateAsync({
        Id,
        SacrificeOrderDate: r.SacrificeOrderDate ?? "",
        Office_Id: r.Office_Id ?? r.OfficeId ?? "",
        GeneralUser_Id: r.GeneralUser_Id ?? r.UserId ?? "",
        SacrificeOrderTotalAmount: r.SacrificeTotalAmount ?? r.TotalAmount ?? 0,
        IsApproved: approve,            
        ApprovedDate: new Date(),       
        ApprovedBy: 1,                  
        IsDone: r.IsDone ?? 0,
      });
      toast({ status: "success", title: approve ? "تمت الموافقة" : "تمّ الرفض" });
      // تحديث البيانات بعد النجاح
      await data?.refetch();
    } catch (e: any) {
      toast({ status: "error", title: "فشل تنفيذ العملية", description: e?.message || "حاول مرة أخرى" });
    }
  };

  const filteredRows = useMemo(() => {
    let currentRows = allRows;
    
    if (selectedStatus !== 0) {
      const statusTarget = selectedStatus === 1; 
      currentRows = currentRows.filter(row => {
        const isApproved = row.IsApproved === true || String(row.IsApproved).toLowerCase() === 'true';
        return isApproved === statusTarget;
      });
    }
    return currentRows;
  }, [allRows, selectedStatus]);

  // ✅ استخدام useMemo لتعريف الأعمدة مع عمود "حالة الطلب" المفقود سابقاً
  const SACRIFICES_COLUMNS: Column[] = useMemo(() => [
    {
      key: "ApplicantName",
      header: "اسم مقدم الطلب",
      width: "20%",
      render: (row: AnyRec) => {
        const r = row as Row;
        return r.UserName ?? r.ApplicantName ?? (r.GeneralUser_Id ? `مستخدم رقم ${r.GeneralUser_Id}` : "—");
      },
    },
    { key: "OfficeName", header: "المكتب", width: "16%", render: (row: AnyRec) => (row as Row).OfficeName ?? "—" },
    { key: "SacrificeOrderDate", header: "تاريخ الطلب", width: "16%", render: (row: AnyRec) => formatApiDate((row as Row).SacrificeOrderDate) },
    {
      key: "SacrificeTotalAmount",
      header: "الإجمالي",
      width: "12%",
      render: (row: AnyRec) => {
        const r = row as Row;
        const v = r.SacrificeTotalAmount ?? r.TotalAmount ?? 0;
        return <Text fontWeight="600">{String(v)} د.ل</Text>;
      },
    },
    {
      key: "IsApproved", 
      header: "حالة الطلب",
      width: "16%",
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
    {
      key: "__actions",
      header: "الإجراءات",
      width: "20%",
      render: (row: AnyRec) => (
        <ActionButtons
          onApprove={() => approveOrReject(row as Row, true)}
          onReject={() => approveOrReject(row as Row, false)}
          disabled={upd.isPending || isFetching}
        />
      ),
    },
  ], [upd.isPending, isFetching, approveOrReject]);

  if (isLoading || isFetching) {
    return (
      <Flex justify="center" p={10}><Spinner size="xl" /></Flex>
    );
  }

  if (isError) {
    return (
      <Alert status='error' m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب البيانات: {(error as Error)?.message || "خطأ في جلب بيانات الأضاحي."}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <DataTable
        title="مراجعة بيانات الأضاحي"
        data={filteredRows as unknown as AnyRec[]}
        columns={SACRIFICES_COLUMNS}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        totalRows={allTotalRows} // استخدام allTotalRows
      />
      
      {filteredRows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">
          لا توجد طلبات أضاحي حاليًا.
        </Text>
      )}
    </Box>
  );
}