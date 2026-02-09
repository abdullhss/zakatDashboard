import React, { useState, useEffect } from "react";
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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getSession } from "../../../session";

const AddFitrZakatTypes = () => {
  const { id } = useParams(); // Get ID from URL if editing
  const location = useLocation();
  const isEditMode = !!id;
  
  // Use data from navigation state or initialize empty
  const initialData = location.state?.itemData || {
    Id: 0,
    ItemName: "",
  };

  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(isEditMode && !location.state?.itemData);

  const toast = useToast();
  const navigate = useNavigate();
  const { officeId } = getSession();

  // If editing and no data was passed via state, fetch it from API
  useEffect(() => {
    const fetchItemData = async () => {
      if (isEditMode && !location.state?.itemData) {
        try {
          // You might need to implement a specific procedure to get single item
          // For now, we'll use the existing procedure with filtering
          const response = await executeProcedure(
            "COuyA9fV1VjMChl9vOK7uw5Uqlu2P7l5ey7zJtWBrXw=",
            `1#1000` // Fetch all items and filter client-side
          );
          
          if (response.decrypted.data.Result[0]) {
            const parsed = JSON.parse(response.decrypted.data.Result[0].ZakatFitrMainItemsData);
            const item = parsed.find(item => item.Id == id);
            if (item) {
              setFormData(item);
            }
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching item:", error);
          toast({
            status: "error",
            title: "خطأ في تحميل البيانات",
          });
          setLoading(false);
        }
      }
    };

    fetchItemData();
  }, [id, isEditMode, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.ItemName.trim()) {
      return toast({
        status: "warning",
        title: "يرجى ملء جميع الحقول",
      });
    }

    try {
      const transactionData = {
        TableName: "SUQrRj4aXGHZtVxaBhnjKB2OdFiLPDGrwFteGIRYxZU=",
        ColumnsNames: "Id#ItemName",
        ColumnsValues: `${formData.Id}#${formData.ItemName}`,
        PointId: 0,
        WantedAction: isEditMode ? 1 : 0, // 1 for edit, 0 for add
      };

      const saveResp = await doTransaction(transactionData);

      if (saveResp.decrypted.result == 200) {
        toast({
          status: "success",
          title: isEditMode ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح",
        });
        navigate("/maindashboard/FitrZakatTypes");
      } else {
        throw new Error("فشل في العملية");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        status: "error",
        title: "حدث خطأ",
        description: "فشل في حفظ البيانات",
      });
    }
  };

  if (loading) {
    return (
      <Box maxW="400px" mx="auto" mt={10} p={5}>
        جاري تحميل البيانات...
      </Box>
    );
  }

  return (
    <Box maxW="400px" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>اسم الصنف</FormLabel>
          <Input
            placeholder="ادخل اسم الصنف"
            name="ItemName"
            value={formData.ItemName}
            onChange={handleChange}
          />
        </FormControl>
        <Button 
          colorScheme="blue" 
          width="100%" 
          onClick={handleSubmit}
          isLoading={loading}
        >
          {isEditMode ? "تعديل" : "إضافة"}
        </Button>
        <Button 
          variant="outline" 
          width="100%" 
          onClick={() => navigate("/maindashboard/FitrZakatTypes")}
        >
          رجوع
        </Button>
      </VStack>
    </Box>
  );
};

export default AddFitrZakatTypes;