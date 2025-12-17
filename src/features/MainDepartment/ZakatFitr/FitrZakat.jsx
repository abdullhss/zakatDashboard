import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { executeProcedure, doTransaction } from "../../../api/apiClient";

const FitrZakat = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasExistingData, setHasExistingData] = useState(false); // 👈 إضافة
  const toast = useToast();

  const formatDateTime = (date) => {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${dd}/${MM}/${yyyy} ${hh}:${mm}:00`;
  };
  const getNowForInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000; // فرق التوقيت
  const local = new Date(now.getTime() - offset);
  return local.toISOString().slice(0, 16);
};


  useEffect(() => {
    const fetchData = async () => {
      const response = await executeProcedure(
        "Sce1eFOykJx+KA+4UIHNzvKIDq08wQibfcVg5Av3Iug=",
        "1#100"
      );

      const data = JSON.parse(
        response?.decrypted?.data?.Result?.[0].ZakatFitrSettingsData
      )[0];

      if (data) {
        setStartDate(data.FromDate);
        setEndDate(data.ToDate);
        setHasExistingData(true); // 👈 معناه إن فيه داتا موجودة
      }
    };

    fetchData();
  }, []);

  const updateDates = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        status: "error",
        title: "تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء",
      });
      return;
    }

    const formattedStart = formatDateTime(startDate);
    const formattedEnd = formatDateTime(endDate);

    const action = hasExistingData ? 1 : 0;
    const response = await doTransaction({
      TableName: "Da3FuqwZ4opR6+dB9chPb4thAYHslRJGNS6fo/V2RRU=",
      ColumnsNames: "id#FromDate#ToDate",
      ColumnsValues: `1#${formattedStart}#${formattedEnd}`,
      PointId: 0,
      WantedAction: action,
    });

    if (response.decrypted.result == 200) {
      toast({
        status: "success",
        title: hasExistingData
          ? "تم تعديل البيانات بنجاح"
          : "تم إضافة البيانات بنجاح",
      });
    }
  };

  return (
    <Box maxW="450px" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading mb={5} textAlign="center" fontSize="xl">
        إعدادات زكاة الفطر
      </Heading>

      <VStack spacing={4}>
        <FormControl>
          <FormLabel>تاريخ البدء</FormLabel>
          <Input
            type="datetime-local"
            value={startDate}
            min={getNowForInput()}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>تاريخ الانتهاء</FormLabel>
          <Input
            type="datetime-local"
            min={startDate || getNowForInput()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormControl>

        <Button width="100%" colorScheme="blue" onClick={updateDates}>
          حفظ
        </Button>
      </VStack>
    </Box>
  );
};

export default FitrZakat;
