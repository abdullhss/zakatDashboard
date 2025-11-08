import { Box, HStack, Text } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import type { AnyRec } from "../../../api/apiClient";
import { useGetUsers } from "../../MainDepartment/Users/hooks/useGetUser";
import { getSession } from "../../../session";
import { useUpdateUser } from "../../MainDepartment/Users/hooks/useUpdateUser"; // هوك التعديل
import { useDeleteUser } from "../../MainDepartment/Users/hooks/useDeleteUser"; // هوك الحذف
import { useNavigate } from "react-router-dom"; // استخدام التوجيه
import { useState } from "react";

const PAGE_SIZE = 10;

export default function UsersOffice() {
  const { officeId } = getSession();
  const navigate = useNavigate(); // للحصول على دالة التوجيه
  
  const [page , setPage] = useState(1);

  const offset = (page - 1) * PAGE_SIZE;
  // جلب البيانات باستخدام هوك
  const { dec ,rows, loading } = useGetUsers({
    startNum: offset,
    count: PAGE_SIZE,
    auto: true,
  });

  const totalRows = Number(dec?.data.Result[0].WorkUsersCount) || 1 ; 
  // هوك التحديث
  const { submit: updateUser, loading: updateLoading, error: updateError } = useUpdateUser();
  
  // هوك الحذف
  const { submit: deleteUser, loading: deleteLoading, error: deleteError } = useDeleteUser();

  const columns = [
    { key: "Id", header: "ID", render: (r: AnyRec) => r.Id ?? r.id },
    { key: "UserName", header: "اسم المستخدم", render: (r: AnyRec) => r.UserName ?? r.LoginName },
    { key: "Email", header: "البريد", render: (r: AnyRec) => r.Email },
    { key: "PhoneNum", header: "الهاتف", render: (r: AnyRec) => r.PhoneNum ?? r.Phone },
    {
      key: "actions",
      header: "الإجراءات",
      render: (r: AnyRec) => (
        <HStack spacing={2}>
          <SharedButton
            variant="brandGradient"
            onClick={() => handleUpdate(r)}
            isLoading={updateLoading}
          >
            تعديل
          </SharedButton>
          <SharedButton
            variant="danger"
            onClick={() => handleDelete(r)}
            isLoading={deleteLoading}
          >
            حذف
          </SharedButton>
        </HStack>
      ),
    },
  ];

  const handleUpdate = (user: AnyRec) => {
    navigate(`/officedashboard/users/edit/${user.Id}`, { state: { userData: user } });
  };

  const handleDelete = async (user: AnyRec) => {
    const deleteUserInput = {
      Id: user.Id,
      UserName: user.UserName,
      Email: user.Email,
      PhoneNum: user.PhoneNum,
      GroupRight_Id: user.GroupRight_Id,
      Office_Id: officeId,
    };
    await deleteUser(deleteUserInput);

  };

  return (
    <Box>
      <DataTable
        title="مستخدمو المكتب"
        data={(rows as AnyRec[]) || []}
        columns={columns as any}
        totalRows={totalRows}
        loading={loading}
        page={page}
        startIndex={offset + 1}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
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
      {updateError && <Text mt={3} color="red.500">{updateError}</Text>}
      {deleteError && <Text mt={3} color="red.500">{deleteError}</Text>}
    </Box>
  );
}
