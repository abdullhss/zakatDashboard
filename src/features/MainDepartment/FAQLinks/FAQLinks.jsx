import React, { use, useEffect, useState } from "react";
import { executeProcedure , doTransaction } from "../../../api/apiClient";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  useToast
} from "@chakra-ui/react";

const FAQLinks = () => {
  const [formData, setFormData] = useState({});

  const [editOrAdd, setEditOrAdd] = useState(0);
  
  const toast = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await executeProcedure(
        "OO3XeYpFBsqxbb+QF28oAgRhMWm0v45l2VSVL04Km+k=",
        0
      );

      const data = JSON.parse(response.decrypted.data.Result[0].SendLinksData);
      console.log("البيانات المسترجعة:", data);

      if (data.length !== 0) {
        setFormData(data[0]);
        setEditOrAdd(1);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await doTransaction({
        TableName:"ta/WdNmY3mNeBLn7p2uzVA==",
        PointId:0,
        WantedAction:editOrAdd , 
        ColumnsNames:"Id#EmailAddress#FacebookLink#WhatsupLink",
        ColumnsValues:`${formData.Id || 0}#${formData.EmailAddress || ''}#${formData.FacebookLink || ''}#${formData.WhatsupLink || ''}`

    })
    if(response.code==200){
        toast({
            title: "تم الإرسال بنجاح",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
    }
    
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>روابط خاصة</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>البريد الإلكتروني</FormLabel>
            <Input
              type="email"
              name="EmailAddress"
              value={formData.EmailAddress}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>رابط الفيسبوك</FormLabel>
            <Input
              type="text"
              name="FacebookLink"
              value={formData.FacebookLink}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>رقم واتساب</FormLabel>
            <Input
              type="text"
              name="WhatsupLink"
              value={formData.WhatsupLink}
              onChange={handleChange}
            />
          </FormControl>

          <Button colorScheme="blue" type="submit">
            إرسال
          </Button>
        </VStack>
      </form>
      {/* <Text mt={4} color="gray.600">الوضع: {editOrAdd === 1 ? "تعديل" : "إضافة جديد"}</Text> */}
    </Box>
  );
};

export default FAQLinks;
