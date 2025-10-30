// src/features/Programs/UseConditions.tsx

import { Box, Text, Heading, Textarea, Button, useToast } from "@chakra-ui/react";
import { useGetProgramData } from "./hooks/useGetProgramData"; 
import { useUpdateProgram } from "./hooks/useUpdateProgram"; 
import { useState } from "react";

export default function UseConditions() {
    const { data, isLoading, isError, error } = useGetProgramData();
    const { mutate, isLoading: isUpdating } = useUpdateProgram();
    const [useConditions, setUseConditions] = useState(data?.rows?.[0]?.UseConditions || '');  // حالة النص المعدل
    const toast = useToast();

    const handleSave = () => {
        const updatedData = {
            id: data?.rows?.[0]?.Id,
            useConditions,  // فقط نرسل الحقل المعدل
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

    if (!data?.rows?.[0]?.UseConditions) {
        return <Text>لا توجد بيانات للعرض.</Text>;
    }

    return (
        <Box p={6}>
            <Heading size="lg" mb={6}>شروط الاستخدام</Heading>
            <Text whiteSpace="pre-wrap" mb={4}>{data?.rows?.[0]?.UseConditions}</Text>  {/* عرض البيانات الحالية */}
            
            {/* textarea للتعديل */}
            <Textarea
                value={useConditions}
                onChange={(e) => setUseConditions(e.target.value)}  // تحديث الحالة عند التعديل
                placeholder="تعديل شروط الاستخدام"
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
