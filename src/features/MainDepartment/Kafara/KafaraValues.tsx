import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import SharedButton from "../../../Components/SharedButton/Button";
import { useGetKafaraValues } from "./hooks/useKafaraValues";
import { useUpdateKafaraValue } from "./hooks/useUpdateKafara";

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

  // ألوان وحدود
  const panelBg = useColorModeValue("white", "gray.800");
  const borderClr = useColorModeValue("#E2E8F0", "whiteAlpha.300");
  const hintClr = useColorModeValue("gray.600", "gray.300");

  // القيمة القادمة من السيرفر
  const serverValue = useMemo(
    () => (data?.currentValue != null ? Number(data.currentValue) : null),
    [data?.currentValue]
  );

  // الخانة التانية: فاضية لحد ما المستخدم يكتب
  const [pendingValue, setPendingValue] = useState<string>("");

  // فضّي خانة الإدخال بعد تحديث السيرفر
  useEffect(() => {
    setPendingValue("");
  }, [serverValue]);

  const commitUpdate = async () => {
    const txt = pendingValue.trim();
    if (txt === "") return;

    const newNum = Number(txt);
    const oldNum = Number(serverValue);

    if (!Number.isFinite(newNum)) {
      toast({
        status: "error",
        title: "قيمة غير صالحة",
        description: "من فضلك أدخل رقمًا صحيحًا.",
      });
      return;
    }
    if (serverValue != null && newNum === oldNum) {
      setPendingValue("");
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: 1, value: newNum, pointId: 0 });
      toast({ status: "success", title: "تم تحديث قيمة الكفّارة." });
      setPendingValue("");
    } catch (e: any) {
      toast({
        status: "error",
        title: e?.message || "تعذر تحديث قيمة الكفّارة.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      commitUpdate();
    }
  };

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box
  dir="rtl"
  w="100%"
  minH="calc(100vh - 120px)"    // الارتفاع الكامل ناقص الهيدر
  display="flex"
  alignItems="flex-start"        // بدل center عشان يكون فوق شويه
  justifyContent="center"
  px={{ base: 3, md: 6 }}
  pt={{ base: "80px", md: "50px" }}   // المسافة من فوق (تقدر تزود أو تقلل)
  pb={{ base: 6, md: 10 }}             // توازن المسافات تحت
    >
      {/* ✅ البوكس نفسه متوسّط، مع حد أقصى للعرض */}
      <Box
        bg={panelBg}
        border="1px solid"
        borderColor={borderClr}
        rounded="15px"
        p="30px"
        w="100%"
        maxW="1060px"
        mx="auto"                
      >
        <VStack spacing="20px" align="stretch">
          {/* الصف الأول: عرض القيمة الحالية (قراءة فقط) */}
          <HStack
            border="1px solid"
            borderColor={borderClr}
            rounded="10px"
            h="65px"
            px="16px"
            justify="space-between"
          >
            <Input
              value={serverValue != null ? String(serverValue) : ""}
              isReadOnly
              variant="unstyled"
              textAlign="left"
              pe="12"
              placeholder=""
              fontWeight="bold"
            />
            <Text color={hintClr} width="10%" fontWeight="600">
  القيمة الحالية
            </Text>
          </HStack>

          {/* الصف الثاني: كتابة قيمة جديدة */}
          <HStack
            border="1px solid"
            borderColor={borderClr}
            rounded="10px"
            h="65px"
            px="16px"
            justify="space-between"
          >
            <Input
              value={pendingValue}
              onChange={(e) => setPendingValue(e.target.value)}
              onBlur={commitUpdate}
              onKeyDown={handleKeyDown}
              isDisabled={updateMutation.isPending}
              type="number"
              step="0.01"
              inputMode="decimal"
              variant="unstyled"
              textAlign="left"
              pe="4"
              placeholder="برجاء تحديث قيمة الكفارة"
            />
            <Text color={hintClr} width="15%" fontWeight="600">
           تحديث القيمة
            </Text>
          </HStack>

          {/* زر شكلي */}
          <Box mt="10px" display="flex" justifyContent="flex-start">
            <SharedButton
              w="180px"
              h="50px"
              rounded="12px"
              fontWeight="700"
              variant="brandGradient"
              color="white"
            >
              حفظ
            </SharedButton>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
