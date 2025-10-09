import { Box, Grid, GridItem, Heading, HStack, Switch, Text, VStack } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import { useLocation, useNavigate } from "react-router-dom";

type CreatedUser = {
  Id?: number | string;
  FullName: string;
  Email: string;
  PhoneNum: string;
  UserName: string;
  UserType: "M" | "O";
  GroupRight_Id?: number | string | 0;
  GroupRight_Name?: string;
  Office_Id?: number | string | 0;
  OfficeName?: string;
  IsActive?: boolean | 0 | 1;
};

export default function UserCreated() {
  const nav = useNavigate();
  const { state } = useLocation() as any;
  const user: CreatedUser | null = state?.user ?? null;

  if (!user) {
    return (
      <Box dir="rtl">
        <Heading size="md" mb={4}>لا توجد بيانات لعرضها</Heading>
        <SharedButton onClick={() => nav("/maindashboard/users")}>رجوع لقائمة المستخدمين</SharedButton>
      </Box>
    );
  }

  const isActive = !!(user.IsActive ?? 1);
  const accountType = user.UserType === "M" ? "إدارة" : "مكتب";

  return (
    <Box dir="rtl">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">بيانات المستخدمين</Heading>
        <HStack>
          <Switch isChecked={isActive} isReadOnly />
          <Text color="gray.600">{isActive ? "مفعل" : "غير مفعل"}</Text>
        </HStack>
      </HStack>

      <Box bg="white" border="1px solid" borderColor="gray.200" rounded="lg" p={{ base: 4, md: 6 }}>
        <Grid templateColumns={{ base: "1fr 1fr" }} rowGap={6} columnGap={8}>
          <GridItem><Text color="gray.700">{user.FullName || "—"}</Text></GridItem>
          <GridItem><Text fontWeight="600">الاسم كامل</Text></GridItem>

          <GridItem><Text dir="ltr" color="gray.700">{user.Email || "—"}</Text></GridItem>
          <GridItem><Text fontWeight="600">البريد الالكتروني</Text></GridItem>

          <GridItem><Text dir="ltr" color="gray.700">{user.PhoneNum || "—"}</Text></GridItem>
          <GridItem><Text fontWeight="600">رقم الهاتف</Text></GridItem>

          <GridItem><Text color="gray.700">{user.UserName || "—"}</Text></GridItem>
          <GridItem><Text fontWeight="600">اسم المستخدم</Text></GridItem>

          {/* مش هنعرِض كلمة المرور حفاظًا على الأمان */}

          <GridItem><Text color="gray.700">{accountType}</Text></GridItem>
          <GridItem><Text fontWeight="600">نوع الحساب</Text></GridItem>

          {user.UserType === "M" ? (
            <>
              <GridItem><Text color="gray.700">{user.GroupRight_Name || `صلاحية #${user.GroupRight_Id ?? "—"}`}</Text></GridItem>
              <GridItem><Text fontWeight="600">الصلاحية</Text></GridItem>
            </>
          ) : (
            <>
              <GridItem><Text color="gray.700">{user.OfficeName || `مكتب #${user.Office_Id ?? "—"}`}</Text></GridItem>
              <GridItem><Text fontWeight="600">المكتب</Text></GridItem>
            </>
          )}
        </Grid>

        <VStack align="flex-start" mt={6}>
          <SharedButton onClick={() => nav("/maindashboard/users")}>رجوع لقائمة المستخدمين</SharedButton>
        </VStack>
      </Box>
    </Box>
  );
}
