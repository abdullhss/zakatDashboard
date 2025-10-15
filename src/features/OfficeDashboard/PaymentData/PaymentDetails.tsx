// src/features/OfficeDashboard/PaymentData/PaymentDetails.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetDashPyamentData } from './hooks/useGetDashPyamentData';  // استيراد الهوك
import { Spinner, Alert, AlertIcon, Box, Text } from '@chakra-ui/react';

const PaymentDetails = () => {
    const { paymentId } = useParams(); // الحصول على الـ paymentId من الـ URL

    if (!paymentId) {
        return <div>الـ ID غير موجود في الرابط!</div>; // في حال لم يوجد الـ paymentId في الرابط
    }

    const { data, isLoading, isError, error } = useGetDashPyamentData(0, 0, 10);  // استخدام الهوك مع الإعدادات الافتراضية للصفحات

    // البحث عن الـ paymentId في البيانات
    const paymentDetails = data?.rows.find((row) => row.PaymentID === parseInt(paymentId));

    if (isLoading) {
        return <Spinner size="xl" />; // عرض مؤشر التحميل أثناء انتظار البيانات
    }

    if (isError) {
        return (
            <Alert status="error">
                <AlertIcon />
                حدث خطأ أثناء جلب بيانات الدفع: {(error as Error)?.message}
            </Alert>
        );
    }

    if (!paymentDetails) {
        return <Box>لا توجد بيانات للمبلغ المحدد.</Box>;  // عرض رسالة في حال لم يتم العثور على المعاملة
    }

    return (
        <Box p={6}>
            <h2>تفاصيل الدفع</h2>
            <Text>رقم المعاملة: {paymentDetails.PaymentID}</Text>
            <Text>تاريخ الدفع: {paymentDetails.PaymentDate}</Text>
            <Text>المبلغ: {paymentDetails.PaymentValue} د.ل.</Text>
            {/* عرض المزيد من التفاصيل حسب الحاجة */}
        </Box>
    );
};

export default PaymentDetails;
