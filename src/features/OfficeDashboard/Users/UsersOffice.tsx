// src/features/OfficeDashboard/Users/UsersOffice.tsx
import { Box, HStack, Text } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import type { AnyRec } from "../../../api/apiClient";
import { useGetUsers } from "../../MainDepartment/Users/hooks/useGetUser";
import { getSession } from "../../../session";

const PAGE_SIZE = 25;

export default function UsersOffice() {
  const { officeId } = getSession();

  // فلترة على المكتب الحالي فقط (لو الهوك بيدعم EncSQL ابعتها، لو مش بيدعم كفاية أن الـ API
  // بيرجع أصلاً حسب المستخدم الحالي)
  const { rows, loading } = useGetUsers({
    startNum: 1,
    count: PAGE_SIZE,
    // encSQLRaw: `WHERE Office_Id = ${officeId} ORDER BY Id DESC`, // استخدم لو مدعوم
    auto: true,
  });

  const columns = [
    { key: "Id", header: "ID", render: (r: AnyRec) => r.Id ?? r.id },
    { key: "UserName", header: "اسم المستخدم", render: (r: AnyRec) => r.UserName ?? r.LoginName },
    { key: "Email", header: "البريد", render: (r: AnyRec) => r.Email },
    { key: "PhoneNum", header: "الهاتف", render: (r: AnyRec) => r.PhoneNum ?? r.Phone },
  ];

  return (
    <Box>
      <DataTable
        title="مستخدمو المكتب"
        data={(rows as AnyRec[]) || []}
        columns={columns as any}
        totalRows={rows?.length || 0}
        loading={loading}
        headerAction={
          <HStack spacing={3}>
            <SharedButton variant="brandGradient" to="/officedashboard/usersOffice/add">
              إضافة مستخدم
            </SharedButton>
          </HStack>
        }
      />
      {!loading && (!rows || rows.length === 0) && (
        <Text mt={3} color="gray.500">لا توجد بيانات.</Text>
      )}
    </Box>
  );
}
