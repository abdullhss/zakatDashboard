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
import { FaInfoCircle, FaSave, FaUndo } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useGetProgramData } from "./hooks/useGetProgramData";
import { updateProgram } from "./Services/updateProgram";

export default function AboutUs() {
  const { data, isLoading, isError, error } = useGetProgramData();
  const [aboutUs, setAboutUs] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const originalAboutUs = data?.rows?.[0]?.AboutUs || "";

  // Initialize state when data loads
  useEffect(() => {
    if (originalAboutUs) {
      setAboutUs(originalAboutUs);
    }
  }, [originalAboutUs]);

  // Check if there are changes
  useEffect(() => {
    setHasChanges(aboutUs !== originalAboutUs);
  }, [aboutUs, originalAboutUs]);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateProgram({
        id: data?.rows?.[0]?.Id,
        aboutUs,
      });
      
      toast({
        title: "تم التحديث بنجاح!",
        description: "تم حفظ معلومات من نحن بنجاح",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "حدث خطأ!",
        description: "لم يتم حفظ التعديلات، يرجى المحاولة مرة أخرى",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setAboutUs(originalAboutUs);
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

  if (!data?.rows?.[0]?.AboutUs) {
    return (
      <Box p={6}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>لا توجد معلومات من نحن محفوظة حالياً</Text>
        </Alert>
      </Box>
    );
  }

  const charCount = aboutUs.length;

  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <Icon as={FaInfoCircle} boxSize={6} color="teal.600" />
          <Heading size="lg" color="gray.700">
            من نحن
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
                معلومات من نحن
              </Text>
              <Text fontSize="sm" color="gray.500">
                عدد الأحرف: {charCount}
              </Text>
            </HStack>
            <Divider />
            
            <Textarea
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder="اكتب أو عدّل معلومات من نحن هنا..."
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