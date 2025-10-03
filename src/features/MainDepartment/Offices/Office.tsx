import { useMemo, useState, useRef } from "react";
import {
  Box, Switch, Text, useDisclosure, Button, HStack, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
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
  const toast = useToast();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const userId = getCurrentUserId();
  const { data, isLoading, isError, error } = useGetOffices(offset, PAGE_SIZE, userId);

  const rows = (data?.rows as OfficeRow[]) ?? [];
  const totalRows = data?.totalRows ?? 0;

  // delete dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  const { hardDelete, softDeactivate } = useDeleteOffice();

  const confirmDelete = (id: number) => {
    setTargetId(id);
    onOpen();
  };

  const doDelete = async () => {
    if (targetId == null) return;
    try {
      const res = await hardDelete.mutateAsync(targetId);
      if (res.flags.FAILURE || res.flags.INTERNAL_ERROR) {
        // غالبًا الرسالة دي بتظهر لما في علاقات تمنع الحذف
        // جرّب تعطيل بدل الحذف
        toast({
          title: res.message || "تعذّر الحذف بسبب وجود علاقات مرتبطة.",
          description: "سنحاول تعطيل السجل بدلًا من حذفه.",
          status: "warning",
          duration: 2500,
          isClosable: true,
        });
        const soft = await softDeactivate.mutateAsync(targetId);
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
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: "companyName",
        header: "اسم الشركة",
        width: "26%",
        render: (row: AnyRec) => {
          const r = row as OfficeRow;
          return (
            <Text fontWeight="600" color="gray.700">
              {r.companyName}
            </Text>
          );
        },
      },
      {
        key: "phone",
        header: "رقم الهاتف",
        width: "22%",
        render: (row: AnyRec) => {
          const r = row as OfficeRow;
          return <Text dir="ltr">{r.phone}</Text>;
        },
      },
      { key: "city", header: "المدينة", width: "18%" },
      {
        key: "isActive",
        header: "الحالة",
        width: "18%",
        render: (row: AnyRec) => {
          const r = row as OfficeRow;
          return (
            <>
              <Switch isChecked={r.isActive} isReadOnly mr={3} />
              <Text as="span" color="gray.600">
                {r.isActive ? "مفعل" : "غير مفعل"}
              </Text>
            </>
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
            <HStack justify="flex-end">
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => confirmDelete(r.id)}
              >
                حذف
              </Button>
            </HStack>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <Box>
        <Text color="gray.600">جارِ التحميل…</Text>
      </Box>
    );
  }

  if (isError) {
    return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;
  }

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
        onEditRow={() => {}}
        onDeleteRow={() => {}} // بنستخدم زرارنا المخصص فوق
        page={page}
        pageSize={PAGE_SIZE}
        totalRows={totalRows}
        onPageChange={setPage}
      />

      {/* Confirm delete */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            تأكيد الحذف
          </AlertDialogHeader>
          <AlertDialogBody>
            هل تريد حذف هذا المكتب؟ لو هناك علاقات مرتبطة قد يتم تعطيله بدلًا من حذفه.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={doDelete} ml={3} isLoading={hardDelete.isPending || softDeactivate.isPending}>
              حذف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
