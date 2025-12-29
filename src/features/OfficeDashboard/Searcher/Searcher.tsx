import { Box, HStack, Input, space, Text, useToast } from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import DataTable from "../../../Components/Table/DataTable";
import { doTransaction, executeProcedure, type AnyRec } from "../../../api/apiClient";
import { useGetUsers } from "../../MainDepartment/Users/hooks/useGetUser";
import { getSession } from "../../../session";
import { useUpdateUser } from "../../MainDepartment/Users/hooks/useUpdateUser"; // هوك التعديل
import { useDeleteUser } from "../../MainDepartment/Users/hooks/useDeleteUser"; // هوك الحذف
import { useNavigate } from "react-router-dom"; // استخدام التوجيه
import { useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button
} from "@chakra-ui/react";

const PAGE_SIZE = 10;

export default function Searcher() {
  const { officeId } = getSession();
  const navigate = useNavigate(); // للحصول على دالة التوجيه
  const toast = useToast() ;
  const [page , setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchers , setSearchers] = useState() ; 
  const [totalRows , setTotalRows] = useState() ; 

  const openDeleteModal = (user: AnyRec) => {
    console.log(user);
    
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setIsDeleteOpen(false);
  };


  const offset = (page - 1) * PAGE_SIZE;
  // جلب البيانات باستخدام هوك
   
  useEffect(()=>{
    const getResarchers = async ()=>{
      const res = await executeProcedure("0C3cI10uY6Oeyb2EXgYMyr4jNYXaV38dKJwjVKVVLJs=" ,  `${officeId}#${offset+1}#${PAGE_SIZE}`)
      setSearchers(res.rows);
      setTotalRows(res.decrypted?.data.Result[0]?JSON.parse(res.decrypted?.data.Result[0]).ResearchersCount : 1);
      
    }
    getResarchers() ;
  },[])

  // هوك التحديث
  const { submit: updateUser, loading: updateLoading, error: updateError } = useUpdateUser();
  
  // هوك الحذف
  const { submit: deleteUser, loading: deleteLoading, error: deleteError } = useDeleteUser();

  const columns = [
    { key: "FullName", header: "اسم الباحث", render: (r: AnyRec) => r.FullName },
    { key: "WhatsUp", header: "رقم الهاتف", render: (r: AnyRec) => r.WhatsUp },
    { key: "IsActive", header: "الحالة", render: (r: AnyRec) => <span>{r.IsActive ? "مفعل" : "غير مفعل"}</span> },
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
    navigate(`/officedashboard/editSearcher`, { state: { searcherData: user } });
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    const response = await doTransaction({
      TableName:"zZGzBNnMImbjd8Cvr8PQaA==" , 
      WantedAction:2 ,
      ColumnsNames:"Id",
      ColumnsValues:selectedUser.Id,
    });
    closeDeleteModal();
    if(response.success){
      location.reload();
    }else{
      toast({
        title:"هذا الباحث مرتبط بطلبات اعانة" , 
        status:"error"
      })
    }
  };


  return (
    <>
    <Box>
        {/* <HStack mb={4} spacing={3}>
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

        </HStack> */}
    </Box>
      <Box>
          <DataTable
            title="الباحثين"
            data={(searchers) || []}
            columns={columns as any}
            totalRows={totalRows}
            // loading={loading}
            page={page}
            startIndex={offset + 1}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            headerAction={
              <HStack spacing={3}>
                <SharedButton variant="brandGradient" to="/officedashboard/addSearcher">
                  إضافة باحث
                </SharedButton>
              </HStack>
            }
          />
          {/* {!loading && rows?.length === 0 && (
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
          )} */}

          {updateError && <Text mt={3} color="red.500" fontSize={18}>{updateError}</Text>}
          {deleteError && <Text mt={3} color="red.500" fontSize={18}>{"هذا الباحث مرتبط"}</Text>}
        </Box>
        <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تأكيد الحذف</ModalHeader>
            <ModalBody>
              هل أنت متأكد أنك تريد حذف الباحث:
              <br />
              <strong>{selectedUser?.FullName}</strong> ؟
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
