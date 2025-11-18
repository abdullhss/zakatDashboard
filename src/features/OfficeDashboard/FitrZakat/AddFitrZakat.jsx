import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {doTransaction} from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../../session";

const AddFitrZakat = () => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  });
  const toast = useToast() ; 
  const navigate = useNavigate() ;
    const { officeId } = getSession();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    const saveData = async ()=>{
        const response = await doTransaction({
            TableName : "4LYYfaWHZlu5nqutMmGQ3g==", 
            ColumnsNames : "Id#Office_Id#ItemName#ItemValue" ,
            ColumnsValues:`0#${officeId}#${formData.name}#${formData.value}`,
            PointId : 0 ,
            WantedAction: 0, // Insert
        }) ;
        if (response.decrypted.result == 200) {
            toast({
                status:"success",
                title:"تمت الاضافة بنجاح"
            })
            navigate("/officedashboard/fitrZakat")
        }
    }
    saveData();
  };

  return (
    <Box maxW="400px" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>اسم الصنف</FormLabel>
          <Input
            placeholder="ادخل اسم الصنف"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>قيمة الفطرة</FormLabel>
          <Input
            placeholder="ادخل قيمة الفطرة"
            name="value"
            type="number"
            value={formData.value}
            onChange={handleChange}
          />
        </FormControl>

        <Button colorScheme="blue" width="100%" onClick={handleSubmit}>
          إضافة
        </Button>
      </VStack>
    </Box>
  );
};

export default AddFitrZakat;
