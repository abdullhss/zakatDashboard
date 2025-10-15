import React, { useState, useMemo } from 'react';
import { Box, Flex, Spinner, Alert, AlertIcon, Text, Select, HStack, Switch } from '@chakra-ui/react';
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetSacrificesDashData } from '../../OfficeDashboard/SacrificesData/hooks/useGetSacrificeData'; 
// === استيراد الدالة المساعدة لـ OfficeId ===
import { getOfficeIdForPayload } from '../../../session'; 

const PAGE_SIZE = 10;

// ===================================
// 1. تعريف الأعمدة (مُعاد وضعه هنا لحل خطأ ReferenceError)
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
            const dateStr = row.SacrificeOrderDate;
            if (dateStr && dateStr.length >= 8) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
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

export default function SacrificeDataTypes() {
    const [page, setPage] = useState(1);
    const limit = PAGE_SIZE;
    const offset = useMemo(() => (page - 1) * limit, [page, limit]);

    const [selectedStatus, setSelectedStatus] = useState<number>(0); 
    
    // === 1. جلب OfficeId الثابت من الجلسة (مطلوب لـ O) ===
    const officeIdForAPI = getOfficeIdForPayload(); 

    // 2. جلب بيانات الأضاحي (يمرر OfficeId الثابت)
    const { data, isLoading, isError, error, isFetching } = useGetSacrificesDashData(
        officeIdForAPI, // ✅ تمرير OfficeId الإلزامي
        offset, 
        limit
    ); 

    const rows = data?.rows ?? [];
    const totalRows = data?.totalRows ?? 0;

    // منطق التصفية المحلية للحالة
    const filteredRows = useMemo(() => {
        let currentRows = rows;
        
        if (selectedStatus !== 0) {
            const statusTarget = selectedStatus === 1; 
            currentRows = currentRows.filter(row => {
                const isApproved = row.IsApproved === true || String(row.IsApproved).toLowerCase() === 'true';
                return isApproved === statusTarget;
            });
        }
        return currentRows;
    }, [rows, selectedStatus]);


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