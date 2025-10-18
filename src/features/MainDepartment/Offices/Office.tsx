import { useMemo, useRef, useState } from "react";
import {
  Box, Text, Switch, HStack, Button, useDisclosure, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";

import { useGetOffices } from "./hooks/useGetOffices";
import { useDeleteOffice } from "./hooks/useDeleteOffice";

type OfficeRow = {
  id: number;
  companyName: string;
  phone: string;
  city: string;
  isActive: boolean;
};

const PAGE_SIZE = 8;

function getCurrentUserId(): number {
  try {
    const keys = ["mainUser", "MainUser", "user", "auth", "login"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const id = obj?.UserId ?? obj?.userId ?? obj?.Id ?? obj?.id;
      if (Number.isFinite(Number(id))) return Number(id);
    }
  } catch {}
  return 1;
}

export default function Office() {
  const navigate = useNavigate();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const userId = getCurrentUserId();
  const { data, isLoading, isError, error } = useGetOffices(offset, PAGE_SIZE, userId);

  const rows = (data?.rows as OfficeRow[]) ?? [];
  const totalRows = data?.totalRows ?? rows.length;

  const dialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [targetRow, setTargetRow] = useState<OfficeRow | null>(null);

  const { hardDelete, softDeactivate } = useDeleteOffice();

  const confirmDelete = (row: OfficeRow) => {
    setTargetRow(row);
    dialog.onOpen();
  };

  const doDelete = async () => {
    if (!targetRow) return;
    try {
      const res = await hardDelete.mutateAsync(targetRow.id);
      if (res.flags.FAILURE || res.flags.INTERNAL_ERROR) {
        toast({
          title: res.message || "تعذّر الحذف بسبب وجود علاقات مرتبطة.",
          description: "سنحاول تعطيل السجل بدلًا من حذفه.",
          status: "warning",
          duration: 2500,
          isClosable: true,
        });
        const soft = await softDeactivate.mutateAsync(targetRow.id);
        if (soft.flags.FAILURE || soft.flags.INTERNAL_ERROR) {
          throw new Error(soft.message || "فشل التعطيل.");
        }
        toast({ title: "تم تعطيل المكتب بدلًا من حذفه.", status: "success" });
      } else {
        toast({ title: "تم حذف المكتب.", status: "success" });
      }
    } catch (e: any) {
      toast({
        title: "حدث خطأ أثناء العملية.",
        description: e?.message,
        status: "error",
      });
    } finally {
      dialog.onClose();
      setTargetRow(null);
    }
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: "officeName",
        header: "اسم المكتب",
        width: "28%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.700">
            {(row as OfficeRow).companyName}
          </Text>
        ),
      },
      {
        key: "phone",
        header: "رقم الهاتف",
        width: "22%",
        render: (row: AnyRec) => <Text dir="ltr">{(row as OfficeRow).phone}</Text>,
      },
      { key: "city", header: "المدينة", width: "18%" },
      {
        key: "isActive",
        header: "الحالة",
        width: "16%",
        render: (row: AnyRec) => {
          const r = row as OfficeRow;
          return (
            <HStack>
              <Switch isChecked={r.isActive} isReadOnly mr={2} />
              <Text color="gray.600">{r.isActive ? "مفعل" : "غير مفعل"}</Text>
            </HStack>
          );
        },
      },
      {
        key: "actions",
        header: "",
        width: "16%",
        render: (row: AnyRec) => {
          const r = row as OfficeRow;
          return (
            <HStack justify="flex-end" spacing={2}>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<EditIcon />}
                onClick={() =>
                  navigate(`/maindashboard/offices/add?edit=${r.id}`, {
                    state: { mode: "edit", row: r },
                  })
                }
              >
                تعديل
              </Button>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => confirmDelete(r)}
              >
                حذف
              </Button>
            </HStack>
          );
        },
      },
    ],
    [navigate]
  );

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box>
      <DataTable
        title="بيانات المكاتب"
        data={rows as unknown as AnyRec[]}
        columns={columns}
        headerAction={
          <SharedButton size="sm" leftIcon={<AddIcon />} to="/maindashboard/offices/add">
            إضافة مكتب
          </SharedButton>
        }
        startIndex={offset + 1}
        page={page}
        pageSize={PAGE_SIZE}
        totalRows={totalRows}
        onPageChange={setPage}
      />

      <AlertDialog isOpen={dialog.isOpen} leastDestructiveRef={cancelRef} onClose={dialog.onClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            تأكيد الحذف
          </AlertDialogHeader>
          <AlertDialogBody>
            هل تريد حذف هذا المكتب؟ لو توجد علاقات مرتبطة قد يتم تعطيله بدلًا من حذفه.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={dialog.onClose}>إلغاء</Button>
            <Button
              colorScheme="red"
              onClick={doDelete}
              ml={3}
              isLoading={hardDelete.isPending || softDeactivate.isPending}
            >
              حذف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
