import React, { useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  HStack,
  VStack,
  useToast,
  Divider,
} from "@chakra-ui/react";

import FieldRow from "../../../Components/SharedField/FieldRow";
import { FieldInput } from "../../../Components/SharedField/FieldControl";
import SharedButton from "../../../Components/SharedButton/Button";
import {
  useUpdateGold24Price,
  useUpdateSilverPrice,
  useUpdateZakahPrice,
} from "./hooks/useZakahPrices";

export default function ZakahGoldValues() {
  const toast = useToast();

  const [gold24, setGold24] = useState<string>("");
  const [silver, setSilver] = useState<string>("");

  // Hooks
  const goldMut = useUpdateGold24Price();  
  const silverMut = useUpdateSilverPrice(); 
  const allMut = useUpdateZakahPrice();    

  const onlyDigits = (s: string) => s.replace(/[^\d.]/g, "");   
  const isNum = (s: string) => /^(\d+(\.\d+)?)$/.test(s);

  const goldOk = useMemo(() => gold24.trim() !== "" && isNum(gold24.trim()), [gold24]);
  const silverOk = useMemo(() => silver.trim() !== "" && isNum(silver.trim()), [silver]);

  async function updateGold() {
    if (!goldOk) {
      toast({ title: "أدخل سعر ذهب صحيح (عيار 24)", status: "warning" });
      return;
    }
    try {
      await goldMut.mutateAsync(onlyDigits(gold24));
      toast({ title: "تم تحديث سعر الذهب (عيار 24)", status: "success" });
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
      // setSilver("");
    } catch (e: any) {
      toast({ title: e?.message || "تعذّر تحديث سعر الفضة", status: "error" });
    }
  }

  async function updateBoth() {
    if (!goldOk && !silverOk) {
      toast({ title: "أدخل القيم التي تريد تحديثها أولاً", status: "warning" });
      return;
    }
    try {
      const tasks: Promise<any>[] = [];
      if (goldOk) tasks.push(allMut.mutateAsync({ id: 4, price: onlyDigits(gold24) }));
      if (silverOk) tasks.push(allMut.mutateAsync({ id: 5, price: onlyDigits(silver) }));
      await Promise.all(tasks);
      toast({ title: "تم التحديث", status: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "تعذّر إتمام التحديث", status: "error" });
    }
  }

  const loading = goldMut.isLoading || silverMut.isLoading || allMut.isLoading;

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
            <Text fontWeight="700" color="gray.800">القيم</Text>
          </HStack>
          <Divider />

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <FieldRow label="سعر الذهب (عيار 24)">
                <FieldInput
                  placeholder="اكتب السعر مثلاً: 420"
                  inputMode="decimal"
                  value={gold24}
                  onChange={(e) => setGold24(e.target.value)}
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
              <FieldRow label="سعر الفضة">
                <FieldInput
                  placeholder="اكتب السعر مثلاً: 120"
                  inputMode="decimal"
                  value={silver}
                  onChange={(e) => setSilver(e.target.value)}
                />
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

                {/* <HStack pt={2}>
                    <SharedButton
                    variant="secondary"
                    onClick={updateBoth}
                    isLoading={loading}
                    isDisabled={(!goldOk && !silverOk) || loading}
                    >
                    حفظ الكل
                    </SharedButton>
                </HStack> */}
        </VStack>
      </Box>
    </Box>
  );
}
