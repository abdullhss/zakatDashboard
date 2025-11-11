// src/features/OfficeDashboard/Payments/GetDashPaymentData.tsx

import React, { useState, useMemo } from 'react';
import { 
    Box, 
    Flex, 
    Spinner, 
    Alert, 
    AlertIcon, 
    Text, 
    Heading, 
    VStack, 
    Icon 
} from '@chakra-ui/react';
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetOfficePayment } from './hooks/useGetOfficePayment';
import SharedButton from '../../../Components/SharedButton/Button';
import { AddIcon } from '@chakra-ui/icons';
import { getSession } from '../../../session';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

// ===================================
// 1. تعريف الأعمدة بدون نسب محددة
// ===================================

const OFFICE_PAYMENT_COLUMNS: Column[] = [
    {
        key: "PaymentValue",
        header: "المبلغ",
        render: (row: AnyRec) => (
            <Text fontWeight="600" color="teal.600">
                {parseFloat(row.PaymentValue ?? '0').toFixed(2)} د.ل.
            </Text>
        ),
    },
    {
        key: "PaymentDate",
        header: "تاريخ الدفع",
        render: (row: AnyRec) => row.PaymentDate ? row.PaymentDate.split('T')[0] : '—',
    },
    {
        key: "PaymentDesc",
        header: "الوصف",
        render: (row: AnyRec) => row.PaymentDesc || '—',
    },
    {
        key: "SubventionTypeName",
        header: "النوع",
        render: (row: AnyRec) =>  row.SubventionTypeName || '—',
    },
    {
        key: "BankName",
        header: "البنك",
        render: (row: AnyRec) => ( row.BankName + '—' + row.AccountNum ) || '—',
    },
];

// ===================================
// 2. مكون عرض البيانات
// ===================================

export default function GetPaymentData() {
    const nav = useNavigate();
    const [page, setPage] = useState(1);
    const limit = PAGE_SIZE;
    const offset = useMemo(() => (page - 1) * limit, [page, limit]);
    
    const { officeId } = getSession(); 
    const currentOfficeId = officeId ?? 0;

    const { data, isLoading, isError, error, isFetching } = useGetOfficePayment(
        offset, 
        limit,
        currentOfficeId
    ); 
    
    const rawRows = Number(data?.decrypted.data.Result[0].OfficePaymentsCount) || 1 ;
    
    let rows: AnyRec[] = [];

    if (rawRows && typeof rawRows === 'string') {
        try {
            rows = JSON.parse(rawRows);
        } catch (e) {
            console.error("Failed to parse OfficePaymentsData:", e);
            rows = [];
        }
    } else if (Array.isArray(data?.rows)) {
        rows = data.rows as AnyRec[];
    }
    
    const totalRows = rawRows;

    if (isLoading && !isFetching) {
        return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
    }

    if (isError) {
        return (
            <Alert status='error' m={6}>
                <AlertIcon />
                حدث خطأ أثناء جلب مدفوعات المكتب: {(error as Error)?.message}
            </Alert>
        );
    }
    console.log(totalRows);
    
    return (
        <Box p={6} dir="rtl">
            <VStack align="stretch" spacing={6}>
                <Heading size="lg" fontWeight="700" color="gray.800">
                    مصروفات المكتب
                </Heading>

                {/* لف الجدول داخل Box عريض مع scroll افقي */}
                <Box width="100%" overflowX="auto">
                    <DataTable
                        title="قائمة المصروفات"
                        data={rows}
                        columns={OFFICE_PAYMENT_COLUMNS}
                        startIndex={offset + 1}
                        page={page}
                        pageSize={limit}
                        onPageChange={setPage}
                        totalRows={totalRows}
                        headerAction={
                            <SharedButton
                                onClick={() => nav("add")} 
                                variant="brandGradient"
                                leftIcon={<Icon as={AddIcon} />}
                            >
                                إضافة مصروفات
                            </SharedButton>
                        }
                        tableProps={{ width: "100%", minWidth: "1000px" }}
                    />
                </Box>

                {rows.length === 0 && !isLoading && (
                    <Text mt={3} color="gray.500">
                        لا توجد مدفوعات مسجلة لهذا المكتب حاليًا.
                    </Text>
                )}
            </VStack>
        </Box>
    );
}
