import {
  Box,
  VStack,
  Text,
  Input,
  useColorModeValue,
  useToast,
  HStack,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useGetKafaraValues } from "./hooks/useKafaraValues";
import { useUpdateKafaraValue } from "./hooks/useUpdateKafara";
import SharedButton from "../../../Components/SharedButton/Button";

function getCurrentUserId(): number {
  try {
    const keys = ["mainUser", "MainUser", "user", "auth", "login"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const id = obj?.UserId ?? obj?.userId ?? obj?.Id ?? obj?.id;
      if (Number.isFinite(Number(id))) return Number(id);
    }
  } catch {}
  return 1;
}

export default function Kafara() {
  const toast = useToast();
  const userId = getCurrentUserId();

  const { data, isLoading, isError, error } = useGetKafaraValues(userId);
  const updateMutation = useUpdateKafaraValue();

  const panelBg = useColorModeValue("white", "gray.800");
  const borderClr = useColorModeValue("#E2E8F0", "whiteAlpha.300");
  const hintClr = useColorModeValue("gray.600", "gray.300");

  const serverValue = useMemo(
    () => (data?.currentValue != null ? Number(data.currentValue) : null),
    [data?.currentValue]
  );

  const [value, setValue] = useState<string>("");
  const [initialValue, setInitialValue] = useState<string>("");

  useEffect(() => {
    if (serverValue != null) {
      setValue(String(serverValue));
      setInitialValue(String(serverValue));
    }
  }, [serverValue]);

  const hasChanged = value.trim() !== initialValue.trim();

  const handleSave = async () => {
    const newNum = Number(value);
    if (!Number.isFinite(newNum)) {
      toast({
        status: "error",
        title: "قيمة غير صالحة",
        description: "من فضلك أدخل رقمًا صحيحًا.",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: 1, value: newNum, pointId: 0 });
      toast({ status: "success", title: "تم حفظ قيمة الكفّارة." });
      setInitialValue(String(newNum));
    } catch (e: any) {
      toast({
        status: "error",
        title: e?.message || "حدث خطأ أثناء حفظ القيمة.",
      });
    }
  };

  const handleReset = () => {
    setValue(initialValue);
  };

  if (isLoading)
    return (
      <Box textAlign="center" mt="50px">
        <Spinner size="lg" />
      </Box>
    );

  if (isError)
    return (
      <Text color="red.500" textAlign="center" mt="40px">
        حدث خطأ: {(error as Error)?.message}
      </Text>
    );

  return (
    <Box
      dir="rtl"
      w="100%"
      minH="calc(100vh - 120px)"
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      // px={{ base: 3, md: 6 }}
      // pt={{ base: "80px", md: "50px" }}
      // pb={{ base: 6, md: 10 }}
    >
      <Box
        bg={panelBg}
        border="1px solid"
        borderColor={borderClr}
        rounded="15px"
        p="40px"
        w="100%"
      >
        <VStack spacing="25px" align="stretch">
          <Text fontSize="2xl" fontWeight="700" textAlign="center" mb="10px">
            القيمة الحالية
          </Text>
          <Input
            value={value}
            type="number"
            inputMode="decimal"
            textAlign="center"
            fontSize="lg"
            fontWeight="500"
            borderColor={borderClr}
            step="0.01"
            onChange={(e) => {
              let val = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(val)) {
                setValue(val);
              }
            }}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal" }}
          />

          <HStack spacing="12px" justify="center" mt="10px">
            <SharedButton
              w="160px"
              h="50px"
              rounded="12px"
              fontWeight="700"
              variant="brandGradient"
              color="white"
              isDisabled={updateMutation.isPending || !hasChanged}
              onClick={handleSave}
            >
              حفظ
            </SharedButton>

            {hasChanged && (
              <Button
                onClick={handleReset}
                variant="outline"
                borderColor="gray.400"
                color={hintClr}
                _hover={{ bg: "gray.100" }}
                w="160px"
                h="50px"
                rounded="12px"
                fontWeight="700"
              >
                إعادة القيمة الأصلية
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
