// src/features/Programs/AboutUs.tsx
import {
  Box,
  Text,
  Heading,
  Spinner,
  Flex,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useGetProgramData } from "./hooks/useGetProgramData";

export default function AboutUs() {
  const { data, isLoading, isError, error } = useGetProgramData();
  const [aboutUs, setAboutUs] = useState("");

  useEffect(() => {
    if (data?.rows?.[0]?.AboutUs) {
      setAboutUs(data.rows[0].AboutUs);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (isError) {
    return <Text color="red.500">حدث خطأ: {error?.message}</Text>;
  }

  return (
    <Box p={6} maxW="5xl" mx="auto" dir="rtl">
      <Heading
        size="lg"
        mb={6}
        color="teal.600"
        textAlign="center"
        fontWeight="bold"
      >
        من نحن
      </Heading>

      <Card variant="outline" boxShadow="md" borderRadius="2xl">
        <CardBody>
          <Text
            fontSize="md"
            lineHeight="2"
            color="gray.800"
            whiteSpace="pre-wrap"
            textAlign="justify"
          >
            {aboutUs || "لا توجد بيانات متاحة حالياً."}
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
}
