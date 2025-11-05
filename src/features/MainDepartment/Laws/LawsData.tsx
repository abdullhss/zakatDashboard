// src/features/Laws/LawsData.tsx

import React, { useState, useMemo, useCallback } from 'react'; 
import { 
    Box, Spinner, Alert, AlertIcon, Flex, Heading, Text, Icon, Menu, MenuButton, MenuList, 
    MenuItem, IconButton, HStack, Portal, useToast, // ✅ استيراد useToast
} from '@chakra-ui/react';
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetLaws } from './hooks/useGetLaw';
import { useDeleteLaw } from './hooks/useDeleteLaw'; // ✅ استيراد هوك الحذف
import SharedButton from '../../../Components/SharedButton/Button';
import { AddIcon } from '@chakra-ui/icons'; 
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;
const BASE_ATTACHMENT_URL = "https://framework.md-license.com:8093/attachments/laws/"; 

// دالة لتحويل التاريخ من الصيغة "YYYY-MM-DD" إلى "DD/MM/YYYY"
function formatDate(date: string): string {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); 
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

// ===================================
// 2. مكون عرض البيانات
// ===================================

export default function LawsData() {
    const navigate = useNavigate(); 
    const toast = useToast(); // ✅ تهيئة التوست
    
    const [page, setPage] = useState(1);
    const limit = PAGE_SIZE;
    const offset = (page - 1) * limit; 
    
    // جلب البيانات
    const { data, isLoading, isError, error, isFetching } = useGetLaws(offset, limit);

        
    // هوك الحذف
    const deleteMutation = useDeleteLaw(); // ✅ تهيئة هوك الحذف
    
    const rows = data?.rows ?? [];
    const totalRows = Number(data?.decrypted.data.Result[0].LawsCount) || 1;

    // === دوال الإجراءات ===
    const handleEdit = useCallback((row: AnyRec) => {
        const lawId = row.Id ?? row.LawId;
        if (!lawId) return;
        navigate("/maindashboard/laws/add", { state: { lawRow: row, mode: 'edit' } }); 
    }, [navigate]);

    const handleDelete = useCallback((row: AnyRec) => {
        const lawId = row.Id ?? row.LawId;
        
        if (!lawId) {
            toast({ title: "خطأ", description: "لم يتم العثور على مُعرف القانون.", status: "error" });
            return;
        }

        // تأكيد الحذف
        if (window.confirm(`هل أنت متأكد من حذف القانون: ${row.LawTitle}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            
            // تنفيذ عملية الحذف
            deleteMutation.mutate(lawId, {
                onSuccess: () => {
                    toast({
                        title: "تم الحذف بنجاح",
                        description: `تم حذف القانون رقم ${lawId} بنجاح.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                },
                onError: (error) => {
                    toast({
                        title: "فشل الحذف",
                        description: `حدث خطأ أثناء حذف القانون: ${(error as Error)?.message || 'خطأ غير معروف'}`,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                },
            });
        }
    }, [deleteMutation, toast]); // ✅ يجب وضع الدوال هنا

    // ⚠️ حالة التحميل تشمل الآن جلب البيانات والحذف
    const isOperationLoading = isLoading || isFetching || deleteMutation.isPending;

    const LAWS_COLUMNS = useMemo(() => [
        {
            key: "LawTitle", header: "عنوان القانون/اللائحة", width: "30%", render: (row: AnyRec) => (<Text fontWeight="600" color="gray.800">{row.LawTitle ?? '—'}</Text>),
        },
        {
            key: "LawText", header: "الوصف", width: "40%", render: (row: AnyRec) => (<Text noOfLines={2}>{row.LawText ?? '—'}</Text>),
        },
        {
            key: "LawDate", header: "تاريخ الإصدار", width: "15%", render: (row: AnyRec) => formatDate(row.LawDate) ?? '—',
        },
        {
            key: "Actions",
            header: "الإجراءات",
            width: "10%",
            render: (row: AnyRec) => (
                <Menu placement="bottom-start" isLazy>
                    <MenuButton as={IconButton} aria-label="إجراءات" icon={<BsThreeDotsVertical />} size="sm" variant="ghost" onClick={(e) => e.stopPropagation()} />
                    <Portal>
                        <MenuList>
                            <MenuItem onClick={() => handleEdit(row)} isDisabled={deleteMutation.isPending}>تعديل</MenuItem>
                            <MenuItem color="red.600" onClick={() => handleDelete(row)} isDisabled={deleteMutation.isPending}>حذف</MenuItem>
                        </MenuList>
                    </Portal>
                </Menu>
            ),
        },
    ], [handleEdit, handleDelete, deleteMutation.isPending]); 

    if (isOperationLoading) {
        return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
    }

    if (isError) {
        return (
            <Alert status='error' m={6}>
                <AlertIcon />
                حدث خطأ أثناء جلب بيانات القوانين: {(error as Error)?.message}
            </Alert>
        );
    }

    return (
        <Box p={6} dir="rtl">
            <HStack justify="space-between" mb={4}>
                <Heading size="lg" fontWeight="700" color="gray.800">
                    بيانات القوانين واللوائح
                </Heading>
                <SharedButton
                    to="/maindashboard/laws/add"
                    variant="brandGradient"
                    leftIcon={<Icon as={AddIcon} />}
                    isDisabled={deleteMutation.isPending} // تعطيل الإضافة أثناء الحذف
                >
                    إضافة قانون/لائحة
                </SharedButton>
            </HStack>
            
            <DataTable
                title="القوانين واللوائح"
                data={rows as AnyRec[]}  
                columns={LAWS_COLUMNS}  
                totalRows={totalRows}  
                page={page} 
                pageSize={limit} 
                onPageChange={setPage}
            />
            
            {rows.length === 0 && !isOperationLoading && (
                <Text mt={3} color="gray.500">
                    لا يوجد بيانات للقوانين واللوائح حالياً.
                </Text>
            )}
        </Box>
    );
}