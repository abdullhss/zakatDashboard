// src/features/Kafara/Kafara.tsx
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

  // الخانة التانية: بتفضل فاضية لحد ما المستخدم يكتب
  const [pendingValue, setPendingValue] = useState<string>("");

  // لو اتغيرت قيمة السيرفر من الريفريش بعد التحديث، مش بنملا الخانة التانية — بنسيبها فاضية
  useEffect(() => {
    setPendingValue(""); // تبقى فاضية دايمًا
  }, [serverValue]);

  const commitUpdate = async () => {
    const txt = pendingValue.trim();
    if (txt === "") return; // مفيش إدخال

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
      // نفس القيمة — مفيش داعي للتحديث
      setPendingValue("");
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: 1, value: newNum, pointId: 0 });
      toast({ status: "success", title: "تم تحديث قيمة الكفّارة." });
      setPendingValue(""); // فضّي الخانة بعد النجاح
      // hook التحديث مفروض بيعمل invalidate للكواري فتتحدّث الخانة اللي فوق تلقائيًا
    } catch (e: any) {
      toast({
        status: "error",
        title: e?.message || "تعذر تحديث قيمة الكفّارة.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur(); // يعمل onBlur الأول
      commitUpdate();
    }
  };

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box dir="ltr">
      <Box
        bg={panelBg}
        border="1px solid"
        borderColor={borderClr}
        rounded="15px"
        p="30px"
        w="100%"
        maxW="1060px"
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
              قيمة الكفارة
            </Text>
          </HStack>

          {/* الصف الثاني: كتابة قيمة جديدة (فاضي دايمًا) */}
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
              onBlur={commitUpdate}            // يحدث القيمة أول ما تخرج من الخانة
              onKeyDown={handleKeyDown}        // أو لما تدوس Enter
              isDisabled={updateMutation.isPending}
              type="number"
              step="0.01"
              inputMode="decimal"
              variant="unstyled"
              textAlign="left"
              pe="4"
              placeholder="برجاء تحديد قيمة الكفارة" // فاضي لحد ما تكتب
            />
            <Text color={hintClr} width="15%" fontWeight="600">
              تحديد قيمة الكفارة
            </Text>
          </HStack>

          {/* زر شكلي في نفس المكان/الستايل (غير مطلوب للتحديث لكن موجود زي التصميم) */}
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
