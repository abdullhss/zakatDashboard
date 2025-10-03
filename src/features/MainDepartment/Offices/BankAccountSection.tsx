import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box, HStack, VStack, Grid, GridItem, Text,
  IconButton, Divider, useColorModeValue,
} from "@chakra-ui/react";

const FIELD_RADIUS = "10px";
const INNER_BORDER = "#B7B7B7";

type Props = {
  index?: number | string;
  bankName: string;
  accountNumber: string | number;
  openingBalance: string | number;
  accountType: string;
  serviceType: string;
  hasCard: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;   // ✅ زرار إضافة
};

export default function BankAccountSection({
  index = 1,
  bankName,
  accountNumber,
  openingBalance,
  accountType,
  serviceType,
  hasCard,
  onDelete,
  onEdit,
  onAdd,
}: Props) {
  const outerBorder = useColorModeValue("background.border", "gray.600");

  return (
    <Box
      bg="background.surface"
      border="1px solid"
      borderColor={outerBorder}
      rounded="lg"
      px={3}
      py={2}
    >
      {/* Header */}
      <HStack justify="space-between" mb={3} dir="rtl" w="full">
        {/* يمين: الرقم + العنوان + زرار إضافة */}
        <HStack spacing={2}>
          <Text color="gray.600">{String(index)}</Text>
          <Text fontWeight="700" color="gray.800">
            الحساب البنكي
          </Text>

          {/* ✅ زرار إضافة صغير قدام العنوان */}
          <IconButton
            aria-label="إضافة حساب"
            icon={<AddIcon />}
            size="xs"
            rounded="md"
            bg="#13312C"
            color="white"
            _hover={{ bg: "#0f2622" }}
            onClick={onAdd}
          />
        </HStack>

        {/* يسار: أيقونات التعديل/الحذف */}
        <HStack spacing={2}>
          <IconButton
            aria-label="تعديل"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={onEdit}
          />
          <IconButton
            aria-label="حذف"
            icon={<DeleteIcon />}
            size="sm"
            variant="ghost"
            color="red.500"
            onClick={onDelete}
          />
        </HStack>
      </HStack>

      {/* باقي التفاصيل */}
      <Box
        rounded={FIELD_RADIUS}
        border="1px solid"
        borderColor={INNER_BORDER}
        bg="white"
        px={4}
        py={3}
      >
        <Grid templateColumns="repeat(12, 1fr)" gap={4} alignItems="center">
          <GridItem colSpan={[12, 12, 12, 2]}>
            <VStack spacing={1}>
              <Text color="gray.700">اسم البنك</Text>
              <Text fontWeight="600">{bankName || "—"}</Text>
            </VStack>
          </GridItem>

          <GridItem colSpan={[12, 12, 12, 3]}>
            <VStack spacing={1}>
              <Text color="gray.700">رقم الحساب</Text>
              <Text dir="ltr" fontWeight="600">
                {accountNumber || "—"}
              </Text>
            </VStack>
          </GridItem>

          <GridItem colSpan={[12, 12, 12, 2]}>
            <VStack spacing={1}>
              <Text color="gray.700">رصيد افتتاحي</Text>
              <Text dir="ltr" fontWeight="600">
                {openingBalance || "—"}
              </Text>
            </VStack>
          </GridItem>

          <GridItem colSpan={[12, 12, 12, 2]}>
            <VStack spacing={1}>
              <Text color="gray.700">نوع الحساب</Text>
              <Text fontWeight="600">{accountType || "—"}</Text>
            </VStack>
          </GridItem>

          <GridItem colSpan={[12, 12, 12, 3]}>
            <VStack spacing={1}>
              <Text color="gray.700">نوع الخدمة</Text>
              <Text fontWeight="600">{serviceType || "—"}</Text>
            </VStack>
          </GridItem>
        </Grid>

        <Divider my={3} borderColor={INNER_BORDER} />

        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          <GridItem colSpan={[12, 6, 4, 3]}>
            <VStack spacing={1}>
              <Text color="gray.700">بطاقة مصرفية</Text>
              <Text fontWeight="600">{hasCard ? "نعم" : "لا"}</Text>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}
