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
import { doMultiTransaction, doTransaction, executeProcedure } from "../../../api/apiClient";

export default function OutFitrZakat() {
  const mainUser = JSON.parse(localStorage.getItem("mainUser"));
  const officeId = mainUser.Office_Id;

  const [outFitrZakatData, setOutFitrZakatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const toast = useToast();

  useEffect(() => {
    const getOutFitrZakatData = async () => {
      const response = await executeProcedure(
        "COuyA9fV1VjMChl9vOK7uw5Uqlu2P7l5ey7zJtWBrXw=",
        `1#1000`
      );

      const parsed = JSON.parse(
        response.decrypted.data.Result[0].ZakatFitrMainItemsData
      ).map((item) => ({
        ...item,
        Qty: 0,
      }));

      setOutFitrZakatData(parsed);
      setLoading(false);
    };

    // Initialize date and time with current values
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    
    setSelectedDate(currentDate);
    setSelectedTime(currentTime);

    getOutFitrZakatData();
  }, []);

  // ========================
  // Format date and time
  // ========================
  const formatSelectedDateTime = () => {
    if (!selectedDate) return formatDate(new Date());
    
    // Combine date and time
    const dateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    // Check if date is valid
    if (isNaN(dateTime.getTime())) {
      return formatDate(new Date());
    }
    
    return formatDate(dateTime);
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const pad = (n) => n.toString().padStart(2, "0");

    return `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
  };

  // ========================
  // Handlers
  // ========================
  const handleChange = (index, value) => {
    const updated = [...outFitrZakatData];
    updated[index].Qty = Number(value) || 0;
    setOutFitrZakatData(updated);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleSave = async () => {
    const hasAtLeastOneQty = outFitrZakatData.some(
      (item) => item.Qty > 0
    );

    if (!hasAtLeastOneQty) {
      return toast({
        status: "warning",
        title: "يرجى إدخال كمية لصنف واحد على الأقل",
      });
    }

    // Format the selected date and time
    const formattedDateTime = formatSelectedDateTime();

    const response1 = await doTransaction({
      TableName: "nOTxzOKZ8iTT2k3Z7VFMPgqAOWdF+pY4zrgyT/0Oqks",
      ColumnsNames: "Id#Office_Id#OutDate",
      ColumnsValues: `${0}#${officeId}#${formattedDateTime}`,
      PointId: 0,
      WantedAction: 0,
    });
    

    const response = await doMultiTransaction({
      MultiTableName: Array(outFitrZakatData.length)
        .fill("nOTxzOKZ8iTT2k3Z7VFMPqhJLFXRsxYXWvyY+0owHec=")
        .join("^"),

      MultiColumnsValues: outFitrZakatData
        .map(
          (item) =>
            `${0}#${response1.decrypted.NewId}#${item.Id}#${item.Qty}`
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
        {/* Date and Time Selection */}
        <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
          <HStack spacing={6} align="flex-end">
            <FormControl flex={1}>
              <FormLabel>تاريخ الصرف</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </FormControl>
            
            <FormControl flex={1}>
              <FormLabel>وقت الصرف</FormLabel>
              <Input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
              />
            </FormControl>
            
            <Box flex={1} pt={8}>
              <Text fontSize="sm" color="gray.600">
                {formatSelectedDateTime()}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Items List */}
        {outFitrZakatData.map((item, index) => (
          <Box
            key={item.Id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
          >
            <HStack spacing={6}>
              <Text fontSize="lg" fontWeight="bold" minW="120px">
                {item.ItemName}
              </Text>

              <FormControl>
                <FormLabel>الكمية</FormLabel>
                <Input
                  type="number"
                  value={item.Qty}
                  onChange={(e) =>
                    handleChange(index, e.target.value)
                  }
                />
              </FormControl>
            </HStack>
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