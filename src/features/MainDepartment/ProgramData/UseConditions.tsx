import { 
  Box, 
  Text, 
  Heading, 
  Textarea, 
  Button, 
  useToast,
  Card,
  CardBody,
  VStack,
  HStack,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FaFileAlt, FaSave, FaUndo } from "react-icons/fa";
import { useGetProgramData } from "./hooks/useGetProgramData"; 
import { useUpdateProgram } from "./hooks/useUpdateProgram"; 
import { useState, useEffect } from "react";

export default function UseConditions() {
  const { data, isLoading, isError, error } = useGetProgramData();
  const { mutate, isLoading: isUpdating } = useUpdateProgram();
  const [useConditions, setUseConditions] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToast();

  const originalConditions = data?.rows?.[0]?.UseConditions || "";

  // Initialize state when data loads
  useEffect(() => {
    if (originalConditions) {
      setUseConditions(originalConditions);
    }
  }, [originalConditions]);

  // Check if there are changes
  useEffect(() => {
    setHasChanges(useConditions !== originalConditions);
  }, [useConditions, originalConditions]);

  const handleSave = () => {
    const updatedData = {
      id: data?.rows?.[0]?.Id,
      useConditions,
    };

    mutate(updatedData, {
      onSuccess: () => {
        toast({
          title: "تم التحديث بنجاح!",
          description: "تم حفظ شروط الاستخدام بنجاح",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      },
      onError: () => {
        toast({
          title: "حدث خطأ!",
          description: "لم يتم حفظ التعديلات، يرجى المحاولة مرة أخرى",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      },
    });
  };

  const handleReset = () => {
    setUseConditions(originalConditions);
    toast({
      title: "تم إعادة الضبط",
      description: "تم استعادة النص الأصلي",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text color="gray.600" fontSize="lg">جاري تحميل البيانات...</Text>
        </VStack>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">حدث خطأ أثناء تحميل البيانات</Text>
            <Text fontSize="sm">{error?.message}</Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  if (!data?.rows?.[0]?.UseConditions) {
    return (
      <Box p={6}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>لا توجد شروط استخدام محفوظة حالياً</Text>
        </Alert>
      </Box>
    );
  }

  const charCount = useConditions.length;

  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <Icon as={FaFileAlt} boxSize={6} color="teal.600" />
          <Heading size="lg" color="gray.700">
            شروط الاستخدام
          </Heading>
          {hasChanges && (
            <Badge colorScheme="orange" fontSize="sm" px={2} py={1}>
              تم التعديل
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* Editor Card */}
      <Card variant="outline" boxShadow="md">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="md" color="gray.700">
                شروط الاستخدام
              </Text>
              <Text fontSize="sm" color="gray.500">
                عدد الأحرف: {charCount}
              </Text>
            </HStack>
            <Divider />
            
            <Textarea
              value={useConditions}
              onChange={(e) => setUseConditions(e.target.value)}
              placeholder="اكتب أو عدّل شروط الاستخدام هنا..."
              size="lg"
              minH="400px"
              fontSize="md"
              lineHeight="tall"
              resize="vertical"
              borderColor="gray.300"
              _hover={{ borderColor: "teal.400" }}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px teal.500",
              }}
            />

            {/* Action Buttons */}
            <HStack spacing={4} justify="flex-end" pt={2}>
              <Button
                leftIcon={<FaUndo />}
                variant="outline"
                colorScheme="gray"
                onClick={handleReset}
                isDisabled={!hasChanges || isUpdating}
                size="lg"
              >
                إعادة ضبط
              </Button>
              <Button
                leftIcon={<FaSave />}
                colorScheme="teal"
                onClick={handleSave}
                isLoading={isUpdating}
                loadingText="جاري الحفظ..."
                isDisabled={!hasChanges}
                size="lg"
                boxShadow="md"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                حفظ التعديلات
              </Button>
            </HStack>

            {hasChanges && (
              <Alert status="warning" borderRadius="md" fontSize="sm">
                <AlertIcon />
                لديك تعديلات غير محفوظة. تأكد من حفظ التغييرات قبل مغادرة الصفحة.
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}