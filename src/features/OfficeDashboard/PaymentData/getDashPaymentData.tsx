import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
    Box, Flex, Spinner, Alert, AlertIcon, Text, HStack, Select, Link, 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, 
    ModalBody, Button, Grid, useToast 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DataTable } from '../../../Components/Table/DataTable';
import type { AnyRec, Column } from '../../../Components/Table/TableTypes';
import { useGetDashPyamentData } from './hooks/useGetDashPyamentData'; 
import { getSession } from '../../../session'; 
import { useGetOffices } from '../../MainDepartment/Offices/hooks/useGetOffices'; 
import { useAddPaymentApproval } from './hooks/useAddPayment'; // هوك الموافقة
import { doTransaction, executeProcedure } from '../../../api/apiClient';
import { useImagesPathContext } from '../../../Context/ImagesPathContext';
import ZakatWasl from '../../../Components/ZakatWasl';
import { toArabicWord } from 'number-to-arabic-words/dist/index-node.js';
import { HandelFile } from '../../../HandleFile';

const PAGE_SIZE = 5;

const formatDateAsDayMonthYear = (value: string | number | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB');
};

// ===================================
// تعريف الأعمدة (لضمان وجودها عند البدء)
// ===================================



export default function GetDashPaymentData() {
    const { imagesPath } = useImagesPathContext();
    // imagesPath is set asynchronously in App.tsx; avoid building links until it's ready (prevents "undefined/..." after refresh)
    const BASE_ATTACHMENT_URL = imagesPath ? `${imagesPath}/` : '';
    /** After first successful generate+upload for a payment, reuse the same URL (avoid regenerating PDF). */
    const generatedWaslAttachmentRef = useRef<Map<string | number, { name: string; ext: string }>>(new Map());
    const PAYMENT_COLUMNS_BASE: Column[] = [
        { key: "Id", header: "رقم المعاملة", render: (row: AnyRec) => row.Id ?? '—', },
        { key: "review", header: "مراجعة", render: (row: AnyRec) => <Button>مراجعة</Button>, },
        { key: "OfficeName", header: "المكتب", render: (row: AnyRec) => row.OfficeName ?? '—' },
        { key: "PaymentDate", header: "تاريخ الدفع", render: (row: AnyRec) => row.PaymentDate ? new Date(row.PaymentDate).toLocaleDateString() : '—', },
        { key: "PaymentValue", header: "المبلغ", render: (row: AnyRec) => (<Text fontWeight="700" color="green.600">{row.PaymentValue ?? '0'} د.ل.</Text>) },
        { key: "PaymentWayName", header: "طريقة الدفع", render: (row: AnyRec) => row.PaymentWayName ?? '—' },
        { key: "IsApproved", header: "الحالة", render: (row: AnyRec) => row.IsApproved ? 'موافقة' : 'معلقة' },
        { key: "GeneralUser_Id", header: "مقدم الطلب", render: (row: AnyRec) => row.UserName ?? '—' }, 
        { key: "ActionName", header: "نوع الخدمة", render: (row: AnyRec) => row.ActionName ?? '—' }, 
        { key: "ProjectName", header: "اسم المشروع", render: (row: AnyRec) => row.ProjectName ?? '—' }, 
        { key: "SubventionTypeName", header: "نوع الإعانة", render: (row: AnyRec) => row.SubventionTypeName ?? '—' }, 
    { key: "AttachmentPhotoName", header: "الوصل", render: (row: AnyRec) => {
        if (!row.AttachmentPhotoName) return '—';
        if (!BASE_ATTACHMENT_URL) return <Text color="gray.500">—</Text>; // imagesPath not loaded yet (e.g. right after refresh)

        const isCurrentRowUploading = isWaslUploading && uploadingReceiptId === (row.Id ?? null);
        if (isCurrentRowUploading) {
            return (
                <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text color="blue.600">جاري رفع الوصل...</Text>
                </HStack>
            );
        }

        return (
            <span
                onClick={async () => {
                    if (isWaslUploading) return;
                    const paymentKey = row.Id ?? '__no_id__';
                    const cachedWasl = generatedWaslAttachmentRef.current.get(paymentKey);
                    if (row.StatementAttachExt) {
                        // await doTransaction({
                        //     TableName: "rCSWIwrXh3HGKRYh9gCA8g==",
                        //     WantedAction: 1,
                        //     ColumnsValues: `${row.Id}#0`,
                        //     ColumnsNames: "Id#StatementAttach",
                        //     PointId: 0,
                        // }) ;
                        window.open(`${BASE_ATTACHMENT_URL}${row.StatementAttachName}${row.StatementAttachExt}`, '_blank');
                    } else if (cachedWasl?.name && cachedWasl?.ext) {
                        window.open(`${BASE_ATTACHMENT_URL}${cachedWasl.name}${cachedWasl.ext}`, '_blank');
                    } else {
                        generateAndUploadZakatWaslPdf(row);
                    }
                }}
                style={{ cursor: isWaslUploading ? 'not-allowed' : 'pointer', color: 'blue' , textDecoration: 'underline', opacity: isWaslUploading ? 0.7 : 1 }}
            >
                الايصال
            </span>
        );
    } },
    ];
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
    const [statusFilter, setStatusFilter] = useState<number>(0);
    const [actionData , setActionData] = useState([]) ;
    const [selectedAction , setSelectedAction] = useState(0) ;
    const waslRef = useRef<HTMLDivElement | null>(null);
    const [waslPayload, setWaslPayload] = useState<AnyRec | null>(null);
    const [isWaslUploading, setIsWaslUploading] = useState(false);
    const [uploadingReceiptId, setUploadingReceiptId] = useState<string | number | null>(null);

    const getAllActions = async ()=>{
        const response = await executeProcedure("3P8RkzNFvgeh6oSPaIf+jVoEFDOVJ+KG83cO0oTKzVY=" , "") ;
        setActionData(response.rows);
    }
    useEffect(()=>{
        getAllActions(); 
    },[])

    const downloadWaslPDFAndUpload = useCallback(async (row: AnyRec) => {
        if (!waslRef.current) return;
        setIsWaslUploading(true);
        setUploadingReceiptId(row.Id ?? null);
        await new Promise(resolve => setTimeout(resolve, 100));

        const waslElement = waslRef.current;
        const originalStyle = waslElement.getAttribute('style');
        waslElement.setAttribute(
            'style',
            'position: fixed; top: -9999px; left: -9999px; width: 1123px; background: white; padding: 24px; visibility: visible; opacity: 1;'
        );

        try {
            const canvas = await html2canvas(waslElement, {
                backgroundColor: '#ffffff',
                scale: 1,
                useCORS: true,
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const scale = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
            const renderWidth = imgProps.width * scale;
            const renderHeight = imgProps.height * scale;
            const x = (pdfWidth - renderWidth) / 2;
            const y = (pdfHeight - renderHeight) / 2;

            pdf.addImage(dataUrl, 'JPEG', x, y, renderWidth, renderHeight);
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `zakat-wasl-${row.Id ?? Date.now()}.pdf`, { type: 'application/pdf' });

            const uploadResult = await new HandelFile().UploadFileWebSite({
                action: 'Add',
                file: pdfFile,
                fileId: '',
                SessionID: '',
                onProgress: () => {},
            });
            console.log(uploadResult);
            

            console.log('Uploaded file id:', uploadResult?.id);
            await doTransaction({
                TableName: "rCSWIwrXh3HGKRYh9gCA8g==",
                WantedAction: 1,
                ColumnsValues: `${row.Id}#${uploadResult?.id}`,
                ColumnsNames: "Id#StatementAttach",
                PointId: 0,
            }) ;
            const response2 = await executeProcedure("rejz6ir0QkiZ4zJBAFkpVRZK3ifpUlwSdAsa/bHrNWY=" , `${row.Id}#$????`)
            const newrow = JSON.parse(response2.decrypted.data.Result[0].PaymentsData)[0] ;
            if (newrow?.StatementAttachName != null && newrow?.StatementAttachExt) {
                generatedWaslAttachmentRef.current.set(row.Id ?? '__no_id__', {
                    name: String(newrow.StatementAttachName),
                    ext: String(newrow.StatementAttachExt),
                });
            }
            window.open(`${BASE_ATTACHMENT_URL}${newrow.StatementAttachName}${newrow.StatementAttachExt}`, '_blank')

        } catch (pdfError: any) {
            toast({
                title: 'فشل إنشاء/رفع الوصل',
                description: pdfError?.message || 'حدث خطأ غير متوقع.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            console.error(pdfError);
        } finally {
            if (originalStyle) {
                waslElement.setAttribute('style', originalStyle);
            } else {
                waslElement.removeAttribute('style');
            }
            setIsWaslUploading(false);
            setUploadingReceiptId(null);
        }
    }, [BASE_ATTACHMENT_URL, toast]);

    const generateAndUploadZakatWaslPdf = useCallback(async (row: AnyRec) => {
        const paymentDate = row.PaymentDate ? formatDateAsDayMonthYear(row.PaymentDate) : '—';
        const donationAmountInWords = `${(toArabicWord as any)(Number(row.PaymentValue) || 0)} دينار ليبي فقط لا غير`;
        setWaslPayload({
            officeName: String(row.OfficeName || 'مجهول'),
            officeId: String(row.Id ?? row.Office_Id ?? ''),
            donationDate: String(paymentDate),
            // donationId: String(row.StatementAttachName || row.PaymentMethod_Id || row.Id || ''),
            donationAmount: String(row.PaymentValue ?? '0'),
            donationAmountInWords: donationAmountInWords,
            donationPhone: String(row.MobileNum || 'مجهول'),
            donationName: String(row.UserName || 'مجهول'),
            donationType: row.ActionName || "غير محدد",
            donationNameForLover: String(row.PaymentDesc || ''),
            paymentDescription: String(row.PaymentDesc || ''),
        });

        await new Promise(resolve => setTimeout(resolve, 150));
        await downloadWaslPDFAndUpload(row);
    }, [downloadWaslPDFAndUpload]);
    
    const approveMutation = useAddPaymentApproval();

    const { data: officesData, isLoading: loadingOffices, isError: isOfficesError } = useGetOffices(0, 100);
    
    const { data, isLoading, isError, error, isFetching } = useGetDashPyamentData(
        isM ? selectedOfficeId : (userOfficeId ?? 0), 
selectedAction,
        offset, 
        limit,
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
        if (col.key === 'review' && col.render) {
            return {
                ...col,
                render: (row: AnyRec) => (
                    <Button
                    onClick={(e) => {
                            e.stopPropagation(); 
                            handleRowClick(row); 
                        }}
                        >مراجعة</Button>
                )
            };
        }
        return col;
    }), [handleRowClick, BASE_ATTACHMENT_URL, generateAndUploadZakatWaslPdf, isWaslUploading, uploadingReceiptId]);
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
                <Select
                    w="260px"
                    placeholder="نوع التبرع"
                    value={selectedAction}
                    onChange={(e) => { setPage(1); setSelectedAction(e.target.value); }}
                    isDisabled={loadingOffices || isOfficesError}
                >
                    <option value={0}>جميع الانواع</option> 
                    {actionData.map((action) => (<option key={action.Id} value={action.Id}>{action.ActionName}</option>))}
                </Select>
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
                        <ModalHeader mt={6} fontWeight="700">تفاصيل المعاملة: #{selectedPaymentDetails.Id}</ModalHeader>
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
                                <Text><strong>اسم مقدم الطلب:</strong> {selectedPaymentDetails.UserName}</Text>
                                <Text><strong>المكتب:</strong> {selectedPaymentDetails.OfficeName}</Text>
                                <Text><strong>اسم المشروع:</strong> {selectedPaymentDetails.ProjectName}</Text>
                                <Text><strong>حالة الموافقة:</strong> {isApproved ? 'موافقة' : 'مرفوض'}</Text> {/* استخدام الحالة المُخزَّنة */}

                                {/* رابط الوصل */}
                                {selectedPaymentDetails.AttachmentPhotoName && BASE_ATTACHMENT_URL && (
                                    <Text colSpan={2}>
                                        <strong>وصل الدفع:</strong>{" "}
                                        <Link href={`${BASE_ATTACHMENT_URL}${selectedPaymentDetails.AttachmentPhotoName}${selectedPaymentDetails.AttachmentPhotoExt}`} isExternal color="blue.500">
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

            <div
                ref={waslRef}
                style={{
                    position: 'fixed',
                    top: '-9999px',
                    left: '-9999px',
                    width: '1123px',
                    background: 'white',
                    padding: '24px',
                }}
            >
                {waslPayload && (
                    <ZakatWasl
                        officeName={String(waslPayload.officeName || 'مجهول')}
                        officeId={String(waslPayload.officeId || '')}
                        donationDate={String(waslPayload.donationDate || '')}
                        donationId={String(waslPayload.donationId || '')}
                        donationAmount={String(waslPayload.donationAmount || '0')}
                        donationAmountInWords={String(waslPayload.donationAmountInWords || '')}
                        donationPhone={String(waslPayload.donationPhone || 'مجهول')}
                        donationName={String(waslPayload.donationName || 'مجهول')}
                        donationType={String(waslPayload.donationType || '')}
                        donationNameForLover={String(waslPayload.donationNameForLover || '')}
                        paymentDescription={String(waslPayload.paymentDescription || '')}
                    />
                )}
            </div>
        </Box>
    );
}