// src/features/Programs/PrivacyPolicy.tsx

import { Box, Text, Heading, Textarea, Button, useToast } from "@chakra-ui/react";
import { useGetProgramData } from "./hooks/useGetProgramData";
import { useUpdateProgram } from "./hooks/useUpdateProgram";
import { useState, useEffect } from "react";

export default function PrivacyPolicy() {
  const { data, isLoading, isError, error } = useGetProgramData();
  const { mutate, isLoading: isUpdating } = useUpdateProgram();
  const toast = useToast();

  const [privacyPolicy, setPrivacyPolicy] = useState("");

  // تحميل النص من البيانات أول ما توصل
  useEffect(() => {
    if (data?.rows?.[0]?.PrivacyPolicy) {
      setPrivacyPolicy(data.rows[0].PrivacyPolicy);
    }
  }, [data]);

  const handleSave = () => {
    const updatedData = {
      id: data?.rows?.[0]?.Id,
      privacyPolicy, // نرسل الحقل فقط
    };

    mutate(updatedData, {
      onSuccess: () => {
        toast({
          title: "تم التحديث بنجاح!",
          description: "تم حفظ سياسة الخصوصية.",
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
    return <Text>حدث خطأ أثناء تحميل البيانات: {error?.message}</Text>;
  }

  if (!data?.rows?.[0]?.PrivacyPolicy) {
    return <Text>لا توجد سياسة خصوصية متاحة حالياً.</Text>;
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>سياسة الخصوصية</Heading>

      {/* عرض النص الحالي */}
      <Text whiteSpace="pre-wrap" mb={4}>
        {data.rows[0].PrivacyPolicy}
      </Text>

      {/* textarea لتعديل النص */}
      <Textarea
        value={privacyPolicy}
        onChange={(e) => setPrivacyPolicy(e.target.value)}
        placeholder="قم بتعديل سياسة الخصوصية هنا..."
        size="md"
        mb={4}
      />

      {/* زر الحفظ */}
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
