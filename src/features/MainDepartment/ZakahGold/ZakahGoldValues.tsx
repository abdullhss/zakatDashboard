// src/features/MainDepartment/ZakahGold/ZakahGoldValues.tsx (الكود كامل)

import React, { useMemo, useState, useEffect } from "react";
import {
  Box, Heading, Text, Grid, GridItem, HStack, VStack, useToast, Divider, Flex, Spinner, Alert, AlertIcon
} from "@chakra-ui/react";
import FieldRow from "../../../Components/SharedField/FieldRow";
import { FieldInput } from "../../../Components/SharedField/FieldControl";
import SharedButton from "../../../Components/SharedButton/Button";

import {
  useUpdateGold24Price,
  useUpdateSilverPrice,
  useUpdateZakahPrice,
} from "./hooks/useZakahPrices";
import { useGetZakahValue } from "./hooks/useGetZakahValue"; 
import type { AnyRec } from "../../../../api/apiClient"; 

// [ملاحظة: دالة extractPrice ستكون في الهوك/Service]

export default function ZakahGoldValues() {
  const toast = useToast();

  const [gold24, setGold24] = useState<string>("");
  const [silver, setSilver] = useState<string>("");

  // Hooks
  const { data: currentPrices, isLoading: loadingCurrent, isError: currentError, refetch } = useGetZakahValue(); 
  const goldMut = useUpdateGold24Price();  
  const silverMut = useUpdateSilverPrice(); 
  const allMut = useUpdateZakahPrice();    

  const onlyDigits = (s: string) => s.replace(/[^\d.]/g, "");   
  const isNum = (s: string) => /^(\d+(\.\d+)?)$/.test(s);

  const goldOk = useMemo(() => gold24.trim() !== "" && isNum(gold24.trim()), [gold24]);
  const silverOk = useMemo(() => silver.trim() !== "" && isNum(silver.trim()), [silver]);

  // === تعبئة حقول الإدخال بالقيم الحالية عند التحميل ===
  useEffect(() => {
    if (currentPrices?.settings) {
        const { gold24: currentGold24Price, silver: currentSilverPrice } = currentPrices.settings;
        
        // تعبئة حقل الذهب (للتعديل)
        if (currentGold24Price !== '0' && currentGold24Price !== '—' && gold24 === '') {
            setGold24(currentGold24Price); 
        }
        
        // تعبئة حقل الفضة (للتعديل)
        if (currentSilverPrice !== '0' && currentSilverPrice !== '—' && silver === '') {
            setSilver(currentSilverPrice); 
        }
    }
  }, [currentPrices, gold24, silver]); 

  async function updateGold() {
    if (!goldOk) {
      toast({ title: "أدخل سعر ذهب صحيح (عيار 24)", status: "warning" });
      return;
    }
    try {
      await goldMut.mutateAsync(onlyDigits(gold24));
      toast({ title: "تم تحديث سعر الذهب (عيار 24)", status: "success" });
      refetch(); // 👈 إعادة جلب القيمة لتحديث العرض
    } catch (e: any) {
      toast({ title: e?.message || "تعذّر تحديث سعر الذهب", status: "error" });
    }
  }

  async function updateSilver() {
    if (!silverOk) {
      toast({ title: "أدخل سعر فضة صحيح", status: "warning" });
      return;
    }
    try {
      await silverMut.mutateAsync(onlyDigits(silver));
      toast({ title: "تم تحديث سعر الفضة", status: "success" });
      refetch(); // 👈 إعادة جلب القيمة لتحديث العرض
      // setSilver(""); // نُبقي القيمة بعد التحديث
    } catch (e: any) {
      toast({ title: e?.message || "تعذّر تحديث سعر الفضة", status: "error" });
    }
  }

  const loading = goldMut.isLoading || silverMut.isLoading || allMut.isLoading || loadingCurrent;
  
  if (loadingCurrent) {
      return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }
  if (currentError) {
      return <Alert status="error" m={6}>حدث خطأ أثناء جلب القيم الحالية.</Alert>;
  }

  return (
    <Box dir="rtl">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          الزكاة <Text as="span" color="gray.500"> / </Text> تحديث أسعار الذهب/الفضة
        </Heading>
      </HStack>

      <Box
        bg="background.surface"
        border="1px solid"
        borderColor="background.border"
        rounded="lg"
        p={{ base: 4, md: 6 }}
        boxShadow="sm"
      >
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Text fontWeight="700" color="gray.800">تحديث القيم</Text>
          </HStack>
          <Divider />

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
                {/* عرض القيمة الحالية للذهب */}
                <Text mb={2} fontSize="md" color="gray.600">
                    القيمة الحالية: 
                    <Text as="span" fontWeight="bold" color="teal.600">
                        {currentPrices?.settings?.gold24 ?? '—'} د.ل.
                    </Text>
                </Text>
                
              <FieldRow label="سعر الذهب (عيار 24)">
                <FieldInput
                  placeholder="أدخل السعر الجديد"
                  inputMode="decimal"
                  value={gold24}
                  onChange={(e) => setGold24(e.target.value)}
                justifyItems="flex-start"
                />
              </FieldRow>
              <HStack mt={2}>
                <SharedButton
                  variant="brandGradient"
                  onClick={updateGold}
                  isLoading={goldMut.isLoading}
                  isDisabled={!goldOk || loading}
                >
                  تحديث الذهب (24)
                </SharedButton>
              </HStack>
            </GridItem>

            <GridItem>
                {/* عرض القيمة الحالية للفضة */}
                <Text mb={2} fontSize="md" color="gray.600">
                    القيمة الحالية: 
                    <Text as="span" fontWeight="bold" color="teal.600">
                        {currentPrices?.settings?.silver ?? '—'} د.ل.
                    </Text>
                </Text>

              <FieldRow label="سعر الفضة">
                <FieldInput
                  placeholder="أدخل السعر الجديد"
                  inputMode="decimal"
                  value={silver}
                  onChange={(e) => setSilver(e.target.value)}
 justifyItems="flex-start"                />
              </FieldRow>
              <HStack mt={2}>
                <SharedButton
                  variant="brandGradient"
                  onClick={updateSilver}
                  isLoading={silverMut.isLoading}
                  isDisabled={!silverOk || loading}
                >
                  تحديث الفضة
                </SharedButton>
              </HStack>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}