// src/features/ZakahTypes/ZakahTypes.tsx
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useGetZakahTypes } from "./hooks/useGetZakahTypes";
import type { AnyRec } from "../../..//api/apiClient";

type ZakahRow = {
  id: number | string;
  name: string;
  isActive: boolean;
};

export default function ZakahTypes() {
  // بنجيب كل الأنواع مرة واحدة (لو عددها كبير جدًا غيّر limit على مزاجك)
  const { data, isLoading, isError, error } = useGetZakahTypes(0, 200);

  const panelBg = useColorModeValue("white", "gray.800");
  const borderClr = useColorModeValue("#E2E8F0", "whiteAlpha.300");
  const titleClr = useColorModeValue("gray.700", "gray.100");
  const hintClr = useColorModeValue("gray.600", "gray.300");

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
        {/* العنوان */}
        <HStack justify="flex-end" mb="12px">
          <Text fontWeight="800" fontSize="lg" color={titleClr}>
            أصناف الزكاة
          </Text>
        </HStack>

        <Divider borderColor={borderClr} mb="10px" />

        {/* الصفوف */}
        <VStack spacing="30px" align="stretch">
          {rows.map((row) => (
            <HStack key={row.id} justify="space-between">
              {/* يمين: اسم الصنف */}
              <Text fontSize="lg" fontWeight="700" color={titleClr}>
                {row.name}
              </Text>

              {/* يسار: حالة الخدمة + سويتش قراءة فقط */}
              <HStack gap={3}>
                <Text color={hintClr} fontWeight="700">
                  {row.isActive ? "مفعل" : "غير مفعل"}
                </Text>
                <Switch isChecked={row.isActive} isReadOnly />
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
