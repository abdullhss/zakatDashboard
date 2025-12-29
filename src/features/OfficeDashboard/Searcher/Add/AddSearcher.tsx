import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { doTransaction } from "../../../../api/apiClient";
import { getSession } from "../../../../session";
import { useNavigate } from "react-router-dom";

const AddSearcher = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    isActive: true,
  });
  const toast = useToast() ;
    const { officeId } = getSession();
  const navigate = useNavigate() ;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const response = await doTransaction({
        TableName:"zZGzBNnMImbjd8Cvr8PQaA==" ,
        WantedAction : 0 ,
        ColumnsNames:"Id#Office_Id#FullName#WhatsUp#IsActive",
        ColumnsValues:`0#${officeId}#${formData.fullName}#${formData.phoneNumber}#${formData.isActive}`,
    });
    if(response.code == 200){
        navigate("/officedashboard/searcher")
    }
    else{
      toast({
        title:response.error ,
        status:"error"
      })
    }
    
  };

  return (
    <Box
      maxW="500px"
      mx="auto"
      mt={10}
      p={6}
      borderRadius="lg"
      boxShadow="md"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {/* الاسم الرباعي */}
          <FormControl isRequired>
            <FormLabel>الاسم الرباعي</FormLabel>
            <Input
              name="fullName"
              placeholder="اكتب الاسم الرباعي"
              value={formData.fullName}
              onChange={handleChange}
            />
          </FormControl>

          {/* رقم الهاتف */}
          <FormControl isRequired>
            <FormLabel>رقم الهاتف</FormLabel>
            <Input
              name="phoneNumber"
              placeholder="09XXXXXXXXX"
              value={formData.phoneNumber}
              onChange={handleChange}
              type="tel"
            />
          </FormControl>

          {/* الحالة */}
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">الحالة</FormLabel>
            <Switch
              name="isActive"
              isChecked={formData.isActive}
              onChange={handleChange}
              colorScheme="green"
            />
          </FormControl>

          {/* زرار الإرسال */}
          <Button type="submit" colorScheme="blue">
            إضافة
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AddSearcher;
