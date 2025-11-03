import React from "react";
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Link,
  Divider,
} from "@chakra-ui/react";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { useGetContactUs } from "./hooks/useGetAboutUs"; // ✅ نفس الـ hook اللي عندك

export default function ContactUsNow() {
  const { data, isLoading, isError, error } = useGetContactUs();

  // ✅ البيانات اللي راجعة بعد التحليل
  const contactInfo = data?.rows?.[0];

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

  if (!contactInfo) {
    return (
      <Alert status="info" mt={6}>
        <AlertIcon />
        لا توجد بيانات تواصل لعرضها.
      </Alert>
    );
  }

  // ✅ مكون فرعي لصف واحد من المعلومات
  const InfoRow = ({
    icon,
    label,
    value,
    isLink = false,
  }: {
    icon: any;
    label: string;
    value?: string;
    isLink?: boolean;
  }) => {
    if (!value) return null;

    const href =
      isLink && !value.startsWith("http") ? `https://${value}` : value;
    const display = value.replace(/^https?:\/\//i, "");

    return (
      <HStack
        spacing={4}
        align="start"
        p={3}
        borderBottom="1px solid"
        borderColor="gray.100"
        _last={{ borderBottom: "none" }}
      >
        <Icon as={icon} w={5} h={5} color="teal.600" mt={1} />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="sm" color="gray.600">
            {label}
          </Text>
          {isLink ? (
            <Link href={href} isExternal color="blue.500" fontWeight="medium">
              {display}
            </Link>
          ) : (
            <Text fontSize="md" color="gray.800">
              {value}
            </Text>
          )}
        </VStack>
      </HStack>
    );
  };

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
        <Icon as={FaPhone} color="teal.500" />
        بيانات التواصل
      </Heading>

      <Card variant="outline" maxW="lg" mx="auto" boxShadow="md">
        <CardBody p={0}>
          <VStack align="stretch" spacing={0} divider={<Divider />}>
            <InfoRow icon={FaPhone} label="رقم الهاتف" value={contactInfo.PhoneNum} />
            <InfoRow icon={FaMapMarkerAlt} label="العنوان" value={contactInfo.Address} />
            <InfoRow
              icon={FaGlobe}
              label="الموقع الإلكتروني"
              value={contactInfo.WebSite}
              isLink
            />
            <InfoRow
              icon={FaFacebook}
              label="فيسبوك"
              value={contactInfo.FaceBook}
              isLink
            />
            <InfoRow
              icon={FaInstagram}
              label="إنستغرام"
              value={contactInfo.Instegram}
              isLink
            />
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
