import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box, HStack, VStack, Grid, GridItem, Text,
  IconButton, Divider, useColorModeValue,
} from "@chakra-ui/react";
import { useBanksQuery } from "../Banks/hooks/useGetBanks";
import { useGetAccountTypes } from "./hooks/useGetAccountTypes";

const FIELD_RADIUS = "10px";
const INNER_BORDER = "#B7B7B7";

type Props = {
  index?: number | string;
  bankName: string | number;       // ✅ خليها تقبل ID
  accountNumber: string | number;
  openingBalance: string | number;
  accountType: string | number;    // ✅ نفس الشيء
  serviceType: string | number;
  hasCard: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
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

  /* البنوك */
  const { data: banksData } = useBanksQuery(0, 200);

  /* أنواع الحسابات */
  const { data: accTypesData } = useGetAccountTypes(0, 200);

  // ✅ تحويل IDs لأسماء حقيقية
  const bankNameDisplay =
    banksData?.rows.find((b: any) => b.Id === Number(bankName))?.BankName || "—";

  const accountTypeDisplay =
    accTypesData?.rows.find((a: any) => a.id === Number(accountType))?.name || "—";

  const serviceTypeDisplay =
    Number(serviceType) === 1
      ? "صدقة"
      : Number(serviceType) === 2
      ? "زكاة"
      : "—";

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
        <HStack spacing={2}>
          <Text color="gray.600">{String(index)}</Text>
          <Text fontWeight="700" color="gray.800">
            الحساب البنكي : {accountNumber || "—"}
          </Text>
        </HStack>

        <HStack spacing={2}>
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
              <Text fontWeight="600">{bankNameDisplay}</Text>
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
              <Text fontWeight="600">{accountTypeDisplay}</Text>
            </VStack>
          </GridItem>

          <GridItem colSpan={[12, 12, 12, 3]}>
            <VStack spacing={1}>
              <Text color="gray.700">نوع الخدمة</Text>
              <Text fontWeight="600">{serviceTypeDisplay}</Text>
            </VStack>
          </GridItem>
        </Grid>

        <Divider my={3} borderColor={INNER_BORDER} />

        <Grid templateColumns="repeat(18, 1fr)" gap={4}>
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
