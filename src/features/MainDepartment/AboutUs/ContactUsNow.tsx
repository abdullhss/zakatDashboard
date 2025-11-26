import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { useGetContactUs } from "./hooks/useGetAboutUs";
import { updateAboutUs } from "../ProgramData/Services/updateProgram";
import { useQueryClient } from "@tanstack/react-query";

// ✅ Move InputField OUTSIDE the component to prevent recreating it on every render
const InputField = ({
  icon,
  label,
  field,
  placeholder,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  field: string;
  placeholder?: string;
  value: string;
  onChange: (field: string, value: string) => void;
}) => {
  return (
    <FormControl>
      <HStack spacing={4} align="start" p={3}>
        <Icon as={icon} w={5} h={5} color="teal.600" mt={2} />
        <VStack align="stretch" spacing={2} flex={1}>
          <FormLabel fontWeight="bold" fontSize="sm" color="gray.600" mb={0}>
            {label}
          </FormLabel>
          <Input
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder || label}
            size="md"
            borderColor="gray.300"
            _hover={{ borderColor: "teal.400" }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          />
        </VStack>
      </HStack>
    </FormControl>
  );
};

export default function ContactUsNow() {
  const { data, isLoading, isError, error } = useGetContactUs();
  const toast = useToast();

  const [formData, setFormData] = useState({
    PhoneNum: "",
    Address: "",
    WebSite: "",
    FaceBook: "",
    Instegram: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const queryClient = useQueryClient();


  // ✅ Load data only once when it arrives from API
  useEffect(() => {
    if (!isInitialized && data?.data?.Result?.[0]?.AboutUsData) {
      const raw = data.data.Result[0].AboutUsData;
      const parsed = raw ? JSON.parse(raw) : [];
      const originalContactInfo = parsed?.[0];

      if (originalContactInfo) {
        setFormData({
          PhoneNum: originalContactInfo.PhoneNum || "",
          Address: originalContactInfo.Address || "",
          WebSite: originalContactInfo.WebSite || "",
          FaceBook: originalContactInfo.FaceBook || "",
          Instegram: originalContactInfo.Instegram || "",
        });
        setIsInitialized(true);
      }
    }
  }, [data, isInitialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    const raw = data?.data?.Result?.[0]?.AboutUsData;
    const parsed = raw ? JSON.parse(raw) : [];
    const originalContactInfo = parsed?.[0];

    if (originalContactInfo) {
      setFormData({
        PhoneNum: originalContactInfo.PhoneNum || "",
        Address: originalContactInfo.Address || "",
        WebSite: originalContactInfo.WebSite || "",
        FaceBook: originalContactInfo.FaceBook || "",
        Instegram: originalContactInfo.Instegram || "",
      });
      toast({
        title: "تم إعادة الضبط",
        description: "تم استعادة القيم الأصلية بنجاح",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleSave = async () => {
    // Here you would typically send the data to your API
    console.log("Saving data:", formData);

    const response = await updateAboutUs(formData);
    if(response.decrypted.result =="200"){
      toast({
        status:"success",
        title:"تم الحفظ بنجاح"
      })
    }
    queryClient.invalidateQueries(["get-contact-us"]);

  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error" mt={6}>
        <AlertIcon />
        {error?.message || "حدث خطأ أثناء تحميل البيانات."}
      </Alert>
    );
  }

  if (!data?.data?.Result?.[0]?.AboutUsData) {
    return (
      <Alert status="info" mt={6}>
        <AlertIcon />
        لا توجد بيانات تواصل لعرضها.
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <Heading
        as="h1"
        size="lg"
        mb={6}
        color="gray.700"
        display="flex"
        alignItems="center"
        gap={2}
      >
        بيانات التواصل
      </Heading>

      <Card variant="outline" mx="auto" boxShadow="md">
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <InputField
              icon={FaPhone}
              label="رقم الهاتف"
              field="PhoneNum"
              placeholder="أدخل رقم الهاتف"
              value={formData.PhoneNum}
              onChange={handleInputChange}
            />
            <InputField
              icon={FaMapMarkerAlt}
              label="العنوان"
              field="Address"
              placeholder="أدخل العنوان"
              value={formData.Address}
              onChange={handleInputChange}
            />
            <InputField
              icon={FaGlobe}
              label="الموقع الإلكتروني"
              field="WebSite"
              placeholder="أدخل الموقع الإلكتروني"
              value={formData.WebSite}
              onChange={handleInputChange}
            />
            <InputField
              icon={FaFacebook}
              label="فيسبوك"
              field="FaceBook"
              placeholder="أدخل رابط فيسبوك"
              value={formData.FaceBook}
              onChange={handleInputChange}
            />
            <InputField
              icon={FaInstagram}
              label="إنستغرام"
              field="Instegram"
              placeholder="أدخل رابط إنستغرام"
              value={formData.Instegram}
              onChange={handleInputChange}
            />

            <HStack spacing={4} pt={4} justify="flex-end">
              <Button
                colorScheme="gray"
                variant="outline"
                onClick={handleReset}
                size="lg"
              >
                إعادة ضبط
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleSave}
                size="lg"
              >
                حفظ
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}