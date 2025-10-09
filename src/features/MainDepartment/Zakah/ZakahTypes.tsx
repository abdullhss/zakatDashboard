// src/features/ZakahTypes/ZakahTypes.tsx
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Divider,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useGetZakahTypes } from "./hooks/useGetZakahTypes";
import { useUpdateZakah } from "./hooks/useUpdateZakah";
import type { AnyRec } from "../../../api/apiClient";

type ZakahRow = {
  id: number | string;
  name: string;
  isActive: boolean;
};

export default function ZakahTypes() {
  const toast = useToast();
  const { data, isLoading, isError, error } = useGetZakahTypes(0, 200);
  const updateMutation = useUpdateZakah();

  const panelBg = useColorModeValue("white", "gray.800");
  const borderClr = useColorModeValue("#E2E8F0", "whiteAlpha.300");
  const titleClr = useColorModeValue("gray.700", "gray.100");
  const hintClr = useColorModeValue("gray.600", "gray.300");

  // نطبّع الصفوف
  const rows: ZakahRow[] = useMemo(() => {
    const src = data?.rows ?? [];
    return src.map((r: AnyRec) => ({
      id:
        r.Id ??
        r.ZakahTypeId ??
        r.ZakatTypeId ??
        r.id ??
        r.code ??
        Math.random().toString(36).slice(2),
      name:
        r.ZakahTypeName ??
        r.ZakatTypeName ??
        r.Name ??
        r.name ??
        "",
      isActive: Boolean(r.IsActive ?? r.isActive ?? r.Active),
    }));
  }, [data?.rows]);

  // حالة تفاؤلية بسيطة للسويتش أثناء الإرسال
  const [optimistic, setOptimistic] = useState<Record<string | number, boolean>>({});

  const currentIsActive = (row: ZakahRow) =>
    optimistic[row.id] ?? row.isActive;

  const handleToggle = async (row: ZakahRow) => {
    const next = !currentIsActive(row);
    // تفاؤليًا
    setOptimistic((s) => ({ ...s, [row.id]: next }));
    try {
      await updateMutation.mutateAsync({ id: row.id, isActive: next, pointId: 0 });
      toast({
        status: "success",
        title: next ? "تم تفعيل الخدمة" : "تم إلغاء تفعيل الخدمة",
      });
    } catch (e: any) {
      // رجّع الحالة القديمة
      setOptimistic((s) => ({ ...s, [row.id]: row.isActive }));
      toast({
        status: "error",
        title: e?.message || "فشل تحديث الحالة",
      });
    }
  };

  if (isLoading) return <Text color={hintClr}>جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box dir="rtl">
      <Box
        bg={panelBg}
        border="1px solid"
        borderColor={borderClr}
        rounded="15px"
        p="24px"
        w="100%"
        maxW="1060px"
      >
        <HStack justify="flex-start" mb="12px">
          <Text fontWeight="800" fontSize="24px" p="20px" color={titleClr}>
            أصناف الزكاة
          </Text>
        </HStack>

        <Divider borderColor={borderClr} mb="10px" />

        <VStack spacing="30px" align="stretch">
          {rows.map((row) => {
            const active = currentIsActive(row);
            return (
              <HStack key={row.id} justify="space-between">
                <Text fontSize="lg" fontWeight="700" color={titleClr}>
                  {row.name}
                </Text>

                <HStack gap={3}>
                  <Text color={hintClr} fontWeight="700">
                    {active ? "مفعل" : "غير مفعل"}
                  </Text>
                  <Switch
                    isChecked={active}
                    isDisabled={updateMutation.isPending}
                    onChange={() => handleToggle(row)}
                  />
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
