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
import { doTransaction, executeProcedure } from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../../session";

const AddFitrZakat = () => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  });

  const toast = useToast();
  const navigate = useNavigate();
  const { officeId } = getSession();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      return toast({
        status: "warning",
        title: "يرجى ملء جميع الحقول",
      });
    }

    // 1) هات البيانات الموجودة
    const response = await executeProcedure(
      "jkE/EfUyfEzbwqK/HolgChI5O++hElNV6y+iDEMHKxo=",
      `${officeId}#1#1000`
    );
    const rawData = response?.decrypted?.data?.Result?.[0]?.ZakatFitrItemsData;

    let parsed = [];

    if (rawData && rawData.trim() !== "") {
      try {
        parsed = JSON.parse(rawData);
      } catch (e) {
        console.error("JSON parse error:", e);
        parsed = [];
      }
    } else {
      parsed = [];
    }
    // 2) اتأكد إن الاسم غير موجود
    const exists = parsed.some(
      (item) => item.ItemName.trim() === formData.name.trim()
    );

    if (exists) {
      return toast({
        status: "error",
        title: "هذا الصنف موجود بالفعل",
      });
    }

    // 3) لو مش موجود → كمل الإضافة
    const saveResp = await doTransaction({
      TableName: "4LYYfaWHZlu5nqutMmGQ3g==",
      ColumnsNames: "Id#Office_Id#ItemName#ItemValue",
      ColumnsValues: `0#${officeId}#${formData.name}#${formData.value}`,
      PointId: 0,
      WantedAction: 0,
    });

    if (saveResp.decrypted.result == 200) {
      toast({
        status: "success",
        title: "تمت الإضافة بنجاح",
      });
      navigate("/officedashboard/fitrZakat");
    }
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
