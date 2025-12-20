import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  VStack,
  Toast,
} from "@chakra-ui/react";
import { doTransaction } from "../../../../api/apiClient";
import { getSession } from "../../../../session";
import { useLocation, useNavigate } from "react-router-dom";

const EditSearcher = () => {
  const location = useLocation() ;
  const [formData, setFormData] = useState({
    fullName: location.state.searcherData.FullName,
    phoneNumber: location.state.searcherData.WhatsUp,
    isActive: location.state.searcherData.IsActive,
  });
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
        WantedAction : 1 ,
        ColumnsNames:"Id#Office_Id#FullName#WhatsUp#IsActive",
        ColumnsValues:`${location.state.searcherData.Id}#${officeId}#${formData.fullName}#${formData.phoneNumber}#${formData.isActive}`,
    });
    if(response.code == 200){
        navigate("/officedashboard/searcher")
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

export default EditSearcher;
