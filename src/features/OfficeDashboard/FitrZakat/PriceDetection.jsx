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

export const PriceDetection = () => {
  const mainUser = JSON.parse(localStorage.getItem("mainUser"));
  const officeId = mainUser.Office_Id;

  const [priceDetectionData, setPriceDetectionData] = useState([]);
  const [priceDetectionStatus, setPriceDetectionStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const getPriceDetectionData = async () => {
      const response = await executeProcedure(
        "6Ww2MAzg8cD417291n9vSqnAsN3R9ufiCAifGGN/y/o=",
        `${officeId}`
      );

      const parsed = JSON.parse(
        response.decrypted.data.Result[0].ZakatFitrOfficeItemsData
      );

      setPriceDetectionData(parsed);
      setPriceDetectionStatus(response.decrypted.data.Result[0].ZakatFitrOfficeItemsStatus);
      setLoading(false);
    };

    getPriceDetectionData();
  }, []);

  const handleChange = (index, field, value) => {
    const updatedData = [...priceDetectionData];
    updatedData[index][field] = value;
    setPriceDetectionData(updatedData);
  };
  

  const handleSave = async () => {
    const response = await doMultiTransaction({
      MultiTableName: Array(priceDetectionData.length).fill("WrHns8LxlBGoeORsr0xKKp9miTjlXSp4ZOaqBlCrwPw=").join("^"),
      MultiColumnsValues: priceDetectionData.map((item) => `${item.Id}#${officeId}#${item.ZakatFitrMainItem_Id}#${item.ItemValue}#${item.MaxQty}`).join("^"),
      WantedAction: priceDetectionStatus =="Insert" ? 0 : 1,
      PointId: 0,
    });

    if(response.code == 200){
        toast({
          status: "success",
          title: "تم الحفظ بنجاح",
        });
    }
    else{
        toast({
            status: "error",
            title: "فشل الحفظ",
            description: response.error,
          });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" mt={10} p={5}>
      <VStack spacing={6} align="stretch">
        {priceDetectionData.map((item, index) => (
          <Box
            key={index}
            p={4}
            borderWidth={1}
            borderRadius="lg"
          >
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="lg">
                {item.ItemName}
              </Text>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>قيمة الصنف</FormLabel>
                  <Input
                    type="number"
                    value={item.ItemValue}
                    onChange={(e) =>
                      handleChange(index, "ItemValue", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>أقصى كمية</FormLabel>
                  <Input
                    type="number"
                    value={item.MaxQty}
                    onChange={(e) =>
                      handleChange(index, "MaxQty", e.target.value)
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
};
