import React, { useState, useMemo, useCallback } from 'react';
import { 
    Box, Flex, Spinner, Alert, AlertIcon, Text, HStack, Select, Link, 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, 
    ModalBody, Button, Grid, useToast 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetDashPyamentData } from './hooks/useGetDashPyamentData'; 
import { getSession } from '../../../session'; 
import { useGetOffices } from '../../MainDepartment/Offices/hooks/useGetOffices'; 
import { useAddPaymentApproval } from './hooks/useAddPayment'; // هوك الموافقة

const PAGE_SIZE = 10;
const BASE_ATTACHMENT_URL = "https://framework.md-license.com:8093/ZakatImages/"; 

// ===================================
// تعريف الأعمدة (لضمان وجودها عند البدء)
// ===================================
const PAYMENT_COLUMNS_BASE: Column[] = [
    { key: "Id", header: "رقم المعاملة", width: "10%", render: (row: AnyRec) => row.Id ?? '—', },
    { key: "OfficeName", header: "المكتب", width: "10%", render: (row: AnyRec) => row.OfficeName ?? '—' },
    { key: "PaymentDate", header: "تاريخ الدفع", width: "10%", render: (row: AnyRec) => row.PaymentDate ? new Date(row.PaymentDate).toLocaleDateString("ar-EG") : '—', },
    { key: "PaymentValue", header: "المبلغ", width: "10%", render: (row: AnyRec) => (<Text fontWeight="700" color="green.600">{row.PaymentValue ?? '0'} د.ل.</Text>) },
    { key: "PaymentWayName", header: "طريقة الدفع", width: "10%", render: (row: AnyRec) => row.PaymentWayName ?? '—' },
    { key: "IsApproved", header: "الحالة", width: "10%", render: (row: AnyRec) => row.IsApproved ? 'موافقة' : 'معلقة' },
    { key: "GeneralUser_Id", header: "مقدم الطلب", width: "10%", render: (row: AnyRec) => row.GeneralUser_Id ?? '—' }, 
    { key: "ActionName", header: "نوع الخدمة", width: "10%", render: (row: AnyRec) => row.ActionName ?? '—' }, 
    { key: "SubventionTypeName", header: "نوع الإعانة", width: "10%", render: (row: AnyRec) => row.SubventionTypeName ?? '—' }, 
    { key: "AttachmentPhotoName", header: "الوصل", width: "10%", render: (row: AnyRec) => row.AttachmentPhotoName ? <Link href={`${BASE_ATTACHMENT_URL}${row.AttachmentPhotoName}`} isExternal color="blue.500">وصل</Link> : '—', },
];


export default function GetDashPaymentData() {
    const [page, setPage] = useState(1);
    const limit = PAGE_SIZE;
    const offset = useMemo(() => (page - 1) * limit, [page, limit]);
    
    const navigate = useNavigate();
    const toast = useToast();
    const { role, officeId: userOfficeId } = getSession(); 
    const isM = role === 'M';
    const initialOfficeId = isM ? 0 : (userOfficeId ?? 0);
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | string>(initialOfficeId); 
    
    // حالة الـ Modal وتفاصيل الدفع المُختارة
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<AnyRec | null>(null); 
    const [isApproved, setIsApproved] = useState<boolean | null>(null); 
    const [statusFilter, setStatusFilter] = useState<number>(0); // 0=الكل

    console.log(selectedPaymentDetails);
    
    const approveMutation = useAddPaymentApproval();

    const { data: officesData, isLoading: loadingOffices, isError: isOfficesError } = useGetOffices(0, 100);
    
    const { data, isLoading, isError, error, isFetching } = useGetDashPyamentData(
        isM ? selectedOfficeId : (userOfficeId ?? 0), 
        offset, 
        limit
    ); 

    const rows = data?.rows;

    const totalRows = Number(data?.decrypted.data.Result[0].PaymentsCount) || 1;

    // منطق استخلاص صفوف الدفع (للتصفية المحلية)
    const formattedRows = useMemo(() => {
        // نعتمد على rows كبيانات أساسية (يفترض أنها مُحللة الآن)
        let currentRows = rows;
        
        // تصفية حسب الحالة (مقبول/مرفوض)
        if (statusFilter !== 0) {
            const statusTarget = statusFilter === 1; // 1: مقبول
            currentRows = currentRows.filter(row => {
                const isRowApproved = row.IsApproved === true || String(row.IsApproved).toLowerCase() === 'true';
                return isRowApproved === statusTarget;
            });
        }
        return currentRows;
    }, [rows, statusFilter]);

    // دالة فتح النموذج عند النقر على ID
    const handleRowClick = useCallback((row: AnyRec) => {
        setSelectedPaymentDetails(row); 
        setIsModalOpen(true); 
        setIsApproved(row.IsApproved === true || String(row.IsApproved).toLowerCase() === 'true'); 
    }, []);

    // دوال الإجراءات للـ Modal
    const handleApprovalAction = async (approved: boolean) => {
        if (!selectedPaymentDetails) return;
        
        const paymentId = selectedPaymentDetails.Id;
        if (!paymentId) return;

        try {
            await approveMutation.mutateAsync({
                paymentId: paymentId,
                isApproved: approved,
            });

            setIsApproved(approved); 
            toast({ title: approved ? "تم القبول بنجاح" : "تم الرفض بنجاح", status: "success", duration: 2000, isClosable: true });
            setTimeout(() => setIsModalOpen(false), 1000);

        } catch (error: any) {
            toast({ title: "فشل العملية", description: error.message || "حدث خطأ في الاتصال بالخادم.", status: "error" });
        }
    };
    
    // إعداد فلتر المكاتب للعرض
    const officesOptions = useMemo(() => { /* ... */ return (officesData?.rows ?? []).map((office: AnyRec) => ({ id: String(office.Id ?? office.Office_Id), name: office.companyName ?? office.OfficeName ?? office.Name, })).filter(o => o.name); }, [officesData?.rows]);


    // === تعريف الأعمدة الديناميكية (لربط onClick) ===
    const FINAL_PAYMENT_COLUMNS: Column[] = useMemo(() => PAYMENT_COLUMNS_BASE.map(col => {
        if (col.key === 'Id' && col.render) {
            return {
                ...col,
                render: (row: AnyRec) => (
                    <Text
                        style={{ cursor: 'pointer', color: '#007BFF', textDecoration: 'underline' }}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleRowClick(row); 
                        }}
                    >
                        {row.Id ?? '—'}
                    </Text>
                )
            };
        }
        return col;
    }), [handleRowClick]);
    // ========================================================


    if (isLoading || isFetching || (isM && loadingOffices)) {
        return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
    }

    if (isError) {
        return (
            <Alert status='error' m={6}>
                <AlertIcon />
                حدث خطأ أثناء جلب بيانات المدفوعات: {(error as Error)?.message}
            </Alert>
        );
    }

    return (
        <Box p={6}>
            <HStack mb={4} spacing={3}>
                {/* فلتر الحالة */}
                {/* <Select
                    w="260px"
                    placeholder="تصفية حسب الحالة"
                    value={statusFilter}
                    onChange={(e) => { setPage(1); setStatusFilter(Number(e.target.value)); }}
                >
                    <option value={0}>كل الحالات</option>
                    <option value={1}>مقبول</option>
                    <option value={2}>مرفوض</option>
                </Select> */}
                
                {/* فلتر المكتب */}
                {isM && (
                    <Select
                        w="260px"
                        placeholder="تصفية حسب المكتب"
                        value={selectedOfficeId}
                        onChange={(e) => { setPage(1); setSelectedOfficeId(e.target.value); }}
                        isDisabled={loadingOffices || isOfficesError}
                    >
                        <option value={0}>جميع المكاتب</option> 
                        {officesOptions.map((office) => (<option key={office.id} value={office.id}>{office.name}</option>))}
                    </Select>
                )}
            </HStack>

            <DataTable
                title="مراجعة المدفوعات"
                data={formattedRows as unknown as AnyRec[]}
                columns={FINAL_PAYMENT_COLUMNS} 
                startIndex={offset + 1}
                page={page}
                pageSize={limit}
                onPageChange={setPage}
                totalRows={totalRows}
                viewHashTag={false}
            />
            
            {formattedRows.length === 0 && (
                <Text mt={3} color="gray.500">لا توجد سجلات مدفوعات حاليًا.</Text>
            )}

            {/* Modal لعرض التفاصيل */}
            {selectedPaymentDetails && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered size="xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader fontWeight="700">تفاصيل المعاملة: #{selectedPaymentDetails.Id}</ModalHeader>
                        <ModalCloseButton isDisabled={approveMutation.isPending} />
                        <ModalBody>
                             <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                {/* عرض التفاصيل */}
                                <Text><strong>رقم المعاملة:</strong> {selectedPaymentDetails.Id}</Text>
                                <Text><strong>تاريخ الدفع:</strong> {selectedPaymentDetails.PaymentDate}</Text>
                                <Text><strong>المبلغ:</strong> <Text as="span" fontWeight="bold">{selectedPaymentDetails.PaymentValue} د.ل.</Text></Text>
                                <Text><strong>طريقة الدفع:</strong> {selectedPaymentDetails.PaymentWayName}</Text>
                                <Text><strong>نوع الخدمة:</strong> {selectedPaymentDetails.ActionName}</Text>
                                <Text><strong>نوع الإعانة:</strong> {selectedPaymentDetails.SubventionTypeName}</Text>
                                <Text><strong>اسم مقدم الطلب:</strong> {selectedPaymentDetails.GeneralUser_Id}</Text>
                                <Text><strong>المكتب:</strong> {selectedPaymentDetails.OfficeName}</Text>
                                <Text><strong>حالة الموافقة:</strong> {isApproved ? 'موافقة' : 'مرفوض'}</Text> {/* استخدام الحالة المُخزَّنة */}

                                {/* رابط الوصل */}
                                {selectedPaymentDetails.AttachmentPhotoName && (
                                    <Text colSpan={2}>
                                        <strong>وصل الدفع:</strong>{" "}
                                        <Link href={`${BASE_ATTACHMENT_URL}${selectedPaymentDetails.AttachmentPhotoName}.jpg`} isExternal color="blue.500">
                                            عرض الوصل المرفق
                                        </Link>
                                    </Text>
                                )}
                            </Grid>
                        </ModalBody>
                        <HStack spacing={4} justify="center" my={4}>
                            <Button colorScheme="green" onClick={() => handleApprovalAction(true)} width="150px" isLoading={approveMutation.isPending}>قبول</Button>
                            <Button colorScheme="red" onClick={() => handleApprovalAction(false)} width="150px" isLoading={approveMutation.isPending} >رفض</Button>
                        </HStack>
                    </ModalContent>
                </Modal>
            )}
        </Box>
    );
}