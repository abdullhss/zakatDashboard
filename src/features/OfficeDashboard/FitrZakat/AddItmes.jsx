import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { doMultiTransaction, executeProcedure } from "../../../api/apiClient";

export default function AddItemsFitrZakat() {
  const mainUser = JSON.parse(localStorage.getItem("mainUser"));
  const officeId = mainUser.Office_Id;

  const [addItemsFitrZakatData, setAddItemsFitrZakatData] = useState([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  // ========================
  // Fetch Data
  // ========================
  useEffect(() => {
    const getAddItemsFitrZakatData = async () => {
      const response = await executeProcedure(
        "COuyA9fV1VjMChl9vOK7uw5Uqlu2P7l5ey7zJtWBrXw=",
        `1#1000`
      );

      const parsed = JSON.parse(
        response.decrypted.data.Result[0].ZakatFitrMainItemsData
      ).map((item) => ({
        ...item,
        Qty: "",
        InputDate: "",
      }));

      setAddItemsFitrZakatData(parsed);
      setLoading(false);
    };

    getAddItemsFitrZakatData();
  }, []);

  // ========================
  // Helpers
  // ========================
  const handleChange = (index, field, value) => {
    const updated = [...addItemsFitrZakatData];
    updated[index][field] = value;
    setAddItemsFitrZakatData(updated);
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);

    const pad = (n) => n.toString().padStart(2, "0");

    return `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
  };

  const handleSave = async () => {
    // Validation بسيط
    const invalidItem = addItemsFitrZakatData.find(
      (item) => !item.Qty || !item.InputDate
    );

    if (invalidItem) {
      return toast({
        status: "warning",
        title: "يرجى إدخال الكمية والتاريخ لكل الأصناف",
      });
    }

    const response = await doMultiTransaction({
      MultiTableName: Array(addItemsFitrZakatData.length)
        .fill("WrHns8LxlBGoeORsr0xKKrVbcY6jBx8aU52h6kl2lyU=")
        .join("^"),

      MultiColumnsValues: addItemsFitrZakatData
        .map(
          (item) =>
            `0#${officeId}#${item.Id}#${formatDateTime(
              item.InputDate
            )}#${item.Qty}`
        )
        .join("^"),

      WantedAction: 0,
      PointId: 0,
    });

    if (response.code === 200) {
      toast({
        status: "success",
        title: "تم الحفظ بنجاح",
      });
    } else {
      toast({
        status: "error",
        title: "فشل الحفظ",
        description: response.error,
      });
    }
  };

  // ========================
  // Loading
  // ========================
  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  // ========================
  // UI
  // ========================
  return (
    <Box maxW="800px" mx="auto" mt={10} p={5}>
      <VStack spacing={6} align="stretch">
        {addItemsFitrZakatData.map((item, index) => (
          <Box
            key={item.Id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
          >
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">
                {item.ItemName}
              </Text>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>الكمية</FormLabel>
                  <Input
                    type="number"
                    value={item.Qty}
                    onChange={(e) =>
                      handleChange(index, "Qty", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>التاريخ والوقت</FormLabel>
                  <Input
                    type="datetime-local"
                    value={item.InputDate}
                    onChange={(e) =>
                      handleChange(index, "InputDate", e.target.value)
                    }
                  />
                </FormControl>
              </HStack>
            </VStack>
          </Box>
        ))}

        <Button
          colorScheme="blue"
          width="100%"
          onClick={handleSave}
        >
          حفظ
        </Button>
      </VStack>
    </Box>
  );
}
