import { Box, HStack, Input, Text } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import type { AnyRec } from "../../../api/apiClient";
import { useGetUsers } from "../../MainDepartment/Users/hooks/useGetUser";
import { getSession } from "../../../session";
import { useUpdateUser } from "../../MainDepartment/Users/hooks/useUpdateUser"; // هوك التعديل
import { useDeleteUser } from "../../MainDepartment/Users/hooks/useDeleteUser"; // هوك الحذف
import { useNavigate } from "react-router-dom"; // استخدام التوجيه
import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button
} from "@chakra-ui/react";

const PAGE_SIZE = 10;

export default function UsersOffice() {
  const { officeId } = getSession();
  const navigate = useNavigate(); // للحصول على دالة التوجيه
  
  const [page , setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");

  const openDeleteModal = (user: AnyRec) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setIsDeleteOpen(false);
  };


  const offset = (page - 1) * PAGE_SIZE;
  // جلب البيانات باستخدام هوك
  const { dec ,rows, loading , refetch } = useGetUsers({
    startNum: offset,
    count: PAGE_SIZE,
    searchText: searchText,
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
            onClick={() => openDeleteModal(r)}
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

  const confirmDelete = async () => {
    if (!selectedUser) return;

    const deleteUserInput = {
      Id: selectedUser.Id,
      UserName: selectedUser.UserName,
      Email: selectedUser.Email,
      PhoneNum: selectedUser.PhoneNum,
      GroupRight_Id: selectedUser.GroupRight_Id,
      Office_Id: officeId,
    };

    const response = await deleteUser(deleteUserInput);
    console.log(response);

    closeDeleteModal();
    location.reload();
  };
  const hasSearch = searchText.trim().length > 0;


  return (
    <>
    <Box>
        <HStack mb={4} spacing={3}>
          <Box flex="1">
            <Input
              placeholder="ابحث باسم الصلاحية..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setSearchText(searchInput);
                }
              }}
            />
          </Box>
  
          <Button
            colorScheme="teal"
            onClick={() => {
              setPage(1);
              setSearchText(searchInput);
            }}
          >
            بحث
          </Button>

        </HStack>
    </Box>
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
          {!loading && rows?.length === 0 && (
            <Text
              mt={4}
              textAlign="center"
              color="gray.500"
              fontSize="lg"
              fontWeight="500"
            >
              {hasSearch
                ? "لا توجد نتائج مطابقة للبحث"
                : "لا توجد بيانات لعرضها"}
            </Text>
          )}

          {updateError && <Text mt={3} color="red.500" fontSize={18}>{updateError}</Text>}
          {deleteError && <Text mt={3} color="red.500" fontSize={18}>{"هذا المستخدم مرتبط"}</Text>}
        </Box>
        <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تأكيد الحذف</ModalHeader>
            <ModalBody>
              هل أنت متأكد أنك تريد حذف المستخدم:
              <br />
              <strong>{selectedUser?.UserName}</strong> ؟
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={closeDeleteModal}>
                إلغاء
              </Button>
              <Button colorScheme="red" ml={3} onClick={confirmDelete} isLoading={deleteLoading}>
                حذف
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </>
  );
}
