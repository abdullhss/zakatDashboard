// src/features/Programs/ContactUs.tsx

import { Box, Text, Heading, Textarea, Button, useToast } from "@chakra-ui/react";
import { useGetProgramData } from "./hooks/useGetProgramData"; 
import { useUpdateProgram } from "./hooks/useUpdateProgram"; 
import { useState } from "react";

export default function ContactUs() {
    const { data, isLoading, isError, error } = useGetProgramData();
    const { mutate, isLoading: isUpdating } = useUpdateProgram();
    const [contactUs, setContactUs] = useState(data?.rows?.[0]?.ContactUs || '');  // حالة النص المعدل
    const toast = useToast();  // لإظهار رسالة عند التحديث

    const handleSave = () => {
        const updatedData = {
            id: data?.rows?.[0]?.Id,
            contactUs,  // فقط نرسل الحقل المعدل
        };

        mutate(updatedData, {
            onSuccess: () => {
                toast({
                    title: "تم التحديث بنجاح!",
                    description: "تم حفظ التعديلات.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            },
            onError: () => {
                toast({
                    title: "حدث خطأ!",
                    description: "لم يتم حفظ التعديلات.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            },
        });
    };

    if (isLoading) {
        return <Text>جاري تحميل البيانات...</Text>;
    }

    if (isError) {
        return <Text>حدث خطأ: {error?.message}</Text>;
    }

    if (!data?.rows?.[0]?.ContactUs) {
        return <Text>لا توجد بيانات للعرض.</Text>;
    }

    return (
        <Box p={6}>
            <Heading size="lg" mb={6}>اتصل بنا</Heading>
            <Text whiteSpace="pre-wrap" mb={4}>{data?.rows?.[0]?.ContactUs}</Text>  {/* عرض البيانات الحالية */}
            
            {/* textarea للتعديل */}
            <Textarea
                value={contactUs}
                onChange={(e) => setContactUs(e.target.value)}  // تحديث الحالة عند التعديل
                placeholder="تعديل بيانات الاتصال"
                size="md"
                mb={4}
            />
            <Button 
                onClick={handleSave} 
                isLoading={isUpdating} 
                colorScheme="teal"
            >
                حفظ التعديلات
            </Button>
        </Box>
    );
}
