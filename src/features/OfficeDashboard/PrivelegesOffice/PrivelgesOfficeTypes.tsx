import {
  Box,
  HStack,
  Text,
  useColorModeValue,
  useToast,
  Badge,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from "@chakra-ui/react";
import { useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import type { AnyRec } from "../../../api/apiClient";
import { useGetPrivilege } from "../../MainDepartment/Privelges/hooks/useGetPrivelge";
import { getSession } from "../../../session";
import { useDeletePrivilege } from "../../MainDepartment/Privelges/hooks/useDeletePrivilege";

type Row = {
  id: string | number;
  name: string;
  isActive: boolean;
  code?: string | number | null;
  type?: string | null;
};

const PAGE_SIZE = 10;

/* قائمة الإجراءات في كل صف */
function RowActionsMenu({
  row,
  onDeleted,
  onEdited,
  deleting,
}: {
  row: Row;
  onDeleted: (row: Row) => void;
  onEdited: (row: Row) => void;
  deleting: boolean;
}) {
  return (
    <Menu placement="bottom-start" isLazy>
      <MenuButton
        as={IconButton}
        aria-label="إجراءات"
        icon={<BsThreeDotsVertical />}
        size="sm"
        variant="ghost"
        onClick={(e) => e.stopPropagation()}
        isDisabled={deleting}
      />
      <Portal>
        <MenuList>
          <MenuItem onClick={() => onEdited(row)}>تعديل</MenuItem>
          <MenuItem color="red.600" onClick={() => onDeleted(row)}>
            حذف
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
}

export default function Privileges() {
  const navigate = useNavigate();
  const toast = useToast();

  const { role, mainUser } = getSession();
  const roleCode = (role || "M") as "M" | "O";

  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const cancelRef = useRef<any>(null);

  const offset = (page - 1) * PAGE_SIZE;

  // جلب البيانات
  const { data, isLoading, isError, error, refetch } = useGetPrivilege(roleCode, offset, PAGE_SIZE);
  const { mutateAsync: deletePrivilege, isPending: deleting } = useDeletePrivilege();
  
  // تجهيز البيانات
  const rows: Row[] = useMemo(() => {
    const src = (data?.rows ?? []) as AnyRec[];
    return src.map((r) => ({
      id:
        r.Id ??
        r.GroupRight_Id ??
        r.GroupRightId ??
        r.RightId ??
        r.Code ??
        r.id ??
        `${Math.random()}`,
      name: r.GroupRightName ?? r.GroupRight_Name ?? r.RightName ?? r.Name ?? r.name ?? "",
      isActive: Boolean(r.IsActive ?? r.Active ?? r.isActive ?? true),
      code: r.Code ?? r.RightCode ?? r.code ?? null,
      type: r.GroupRightType ?? r.Type ?? roleCode,
    }));
  }, [data?.rows, roleCode]);

  const totalRows = Number(data?.decrypted.data.Result[0].GroupRightsCount) || 1

  const titleClr = useColorModeValue("gray.700", "gray.100");

  // بناء لينك التعديل
  const buildUpdateUrl = (id: string | number, rc: "M" | "O") =>
    `/officedashboard/privelges/update?groupId=${encodeURIComponent(
      String(id)
    )}&featureType=${rc === "M" ? "1" : "2"}&role=${rc}`;

  // تعديل صلاحية
  const onEditRow = useCallback(
    (row: AnyRec) => {
      const id =
        row.id ?? row.GroupRightId ?? row.GroupRight_Id ?? row.RightId ?? `${Math.random()}`;
      if (!id) {
        toast({ title: "لا يمكن تحديد الصلاحية للتعديل", status: "warning" });
        return;
      }
      console.log(buildUpdateUrl(id, roleCode), { state: { row } });
      
      navigate(buildUpdateUrl(id, roleCode), { state: { row } });
    },
    [navigate, roleCode, toast]
  );

  // حذف صلاحية
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePrivilege(deleteId);
      toast({ title: "تم حذف الصلاحية بنجاح", status: "success" });
      setDeleteId(null);
      refetch();
    } catch {
      toast({ title: "فشل في حذف الصلاحية", status: "error" });
    }
  };

  // الأعمدة
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "اسم الصلاحية",
        width: "90%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color={titleClr}>
            {(row as Row).name}
          </Text>
        ),
      },
      {
        key: "actions",
        header: "إجراءات",
        width: "10%",
        render: (row: AnyRec) => (
          <RowActionsMenu
            row={row as Row}
            onDeleted={(r) => setDeleteId(r.id)}
            onEdited={onEditRow}
            deleting={deleting}
          />
        ),
      },
    ],
    [titleClr, deleting, onEditRow]
  );

  // تحديث القائمة
  const onRefresh = useCallback(() => {
    refetch();
    toast({
      title: "تم تحديث القائمة",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "top",
    });
  }, [refetch, toast]);

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box>
      {/* ======= الرأس ======= */}
      <HStack justify="space-between" mb={3}>
        <HStack>
          {mainUser?.GroupRightName ? (
            <Badge variant="outline" colorScheme="blue">
              مجموعتي: {mainUser.GroupRightName}
            </Badge>
          ) : null}
        </HStack>

        <HStack spacing={3}>
          <SharedButton variant="brandGradient" to={`/officedashboard/privelgesOffice/add`}>
            إضافة
          </SharedButton>

          <Button colorScheme="teal" variant="outline" onClick={onRefresh}>
            تحديث القائمة
          </Button>
        </HStack>
      </HStack>

      {/* ======= الجدول ======= */}
      <DataTable
        title="صلاحيات المجموعات"
        data={rows}
        columns={columns}
        totalRows={totalRows}
        stickyHeader
        loading={isLoading || deleting}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {rows.length === 0 && (
        <Text mt={3} color="gray.500">
          لا توجد بيانات لصلاحيات هذا الدور.
        </Text>
      )}

      {/* ======= تأكيد الحذف ======= */}
      <AlertDialog
        isOpen={!!deleteId}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              تأكيد الحذف
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف هذه الصلاحية؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)} isDisabled={deleting}>
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={deleting}>
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
