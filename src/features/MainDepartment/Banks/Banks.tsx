// src/features/MainDepartment/Banks/Banks.tsx
import { useMemo, useRef, useState } from "react";
import {
  Box, Spinner, Flex, Alert, AlertIcon, useDisclosure, useToast,
  Menu, MenuButton, MenuList, MenuItem, IconButton,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter, HStack,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

import { useBanksQuery } from "./hooks/useGetBanks";
import { useAddBank } from "./hooks/useAddBank";
import { useDeleteBank } from "./hooks/useDeleteBank";
import { useUpdateBank } from "./hooks/useUpdateBank";

import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { DataTable } from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import FormModal, { type FieldConfig } from "../../../Components/ModalAction/FormModel";

// ✅ استدعاء جلب المكاتب لاختبار الارتباط
// لو مسار الخدمة مختلف عدّله حسب مشروعك
import { getOffices } from "../Offices/Services/getOffice";
import { AddIcon } from "@chakra-ui/icons";

/* ----------------- دالة مساعدة: هل يوجد مكاتب مرتبطة بهذا البنك؟ ----------------- */
async function hasOfficesForBank(bankId: number | string): Promise<boolean> {
  const PAGE_SIZE = 200;
  let offset = 0;

  while (true) {
    const res = await getOffices(offset, PAGE_SIZE);
    const rows = res?.rows ?? [];
    if (!rows.length) return false;

    const found = rows.some((r: AnyRec) => {
      const rid =
        r.BankId ?? r.bankId ?? r.Bank_Id ?? r.bank_id ?? r.BankID ?? r.bankID;
      return Number(rid) === Number(bankId);
    });
    if (found) return true;

    offset += rows.length;
    if (rows.length < PAGE_SIZE) return false; // آخر صفحة
  }
}

/* ----------------- قائمة الإجراءات لكل صف بنك ----------------- */
function RowActions({
  row,
  onChanged,
}: {
  row: AnyRec;
  onChanged: () => void;
}) {
  const toast = useToast();
  const del = useDeleteBank();
  const upd = useUpdateBank();

  const confirmDel = useDisclosure();
  const editModal = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const id = row.Id ?? row.id ?? row.BankId ?? row.bank_id;

  const initialEditVals = useMemo(
    () => ({
      bankName: row.BankName ?? row.Bank_Name ?? "",
      bankCode: row.BankCode ?? row.Bank_Code ?? row.SwiftCode ?? "",
    }),
    [row]
  );

  const editFields: FieldConfig[] = [
    {
      name: "bankName",
      label: "اسم البنك",
      placeholder: "برجاء كتابة اسم البنك",
      required: true,
      type: "input",
      colSpan: 2,
    },
  ];

  const handleEditSubmit = async (vals: { bankName: string; bankCode?: string }) => {
    await upd.mutateAsync({ id, bankName: vals.bankName, bankCode: vals.bankCode });
    toast({ status: "success", title: "تم التعديل", description: "تم تعديل البنك بنجاح" });
    editModal.onClose();
    onChanged();
  };

  const handleDelete = async () => {
    try {
      // ✅ فحص: البنك مرتبط بمكاتب؟
      const linked = await hasOfficesForBank(id);
      if (linked) {
        toast({
          status: "warning",
          title: "لا يمكن الحذف",
          description: "لا يمكن حذف هذا البنك لأنه مرتبط بمكتب. قم بنقل/تعديل المكاتب المرتبطة أولًا.",
          duration: 6000,
          isClosable: true,
        });
        confirmDel.onClose();
        return;
      }

      // لا يوجد ارتباط ⇒ نحذف
      await del.mutateAsync(id);
      toast({ status: "success", title: "تم الحذف", description: "تم حذف البنك بنجاح" });
      confirmDel.onClose();
      onChanged();
    } catch (e: any) {
      // fallback: لو الـAPI رجّع رفض بسبب قيود FK
      const code = e?.code ?? e?.sqlState ?? e?.number;
      const msg: string = String(e?.message || e?.data?.message || e?.error || "");
      const fkBlocked =
        code === 547 ||
        /foreign key|constraint|reference|is referenced|violates/i.test(msg) ||
        /مرتبطة|ارتباط|مربوط/i.test(msg);

      if (fkBlocked) {
        toast({
          status: "warning",
          title: "لا يمكن الحذف",
          description: "لا يمكن حذف هذا البنك لأنه مرتبط بمكتب.",
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          status: "error",
       title: "لا يمكن الحذف",
          description: "لا يمكن حذف هذا البنك لأنه مرتبط بمكتب.",
          duration: 6000,
          isClosable: true,
        });
      }
      confirmDel.onClose();
    }
  };

  return (
    <>
      <Menu placement="bottom-start" isLazy>
        <MenuButton
          as={IconButton}
          aria-label="إجراءات"
          icon={<BsThreeDotsVertical />}
          size="sm"
          variant="brandOutline"
        />
        <MenuList>
          {/* <MenuItem onClick={editModal.onOpen}>تعديل</MenuItem> */}
          <MenuItem color="red.600" onClick={confirmDel.onOpen}>حذف</MenuItem>
        </MenuList>
      </Menu>

      <FormModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        title="تعديل بنك"
        fields={editFields}
        initialValues={initialEditVals}
        submitLabel="تحديث"
        cancelLabel="إلغاء"
        isSubmitting={upd.isPending}
        onSubmit={handleEditSubmit}
      />

      <AlertDialog
        isOpen={confirmDel.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={confirmDel.onClose}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontWeight="700">حذف البنك</AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من حذف “{initialEditVals.bankName || "هذا البنك"}”؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogBody>
          <AlertDialogFooter w="100%">
            <HStack w="100%" spacing={4} justify="space-around">
              <SharedButton
                label="إلغاء"
                variant="dangerOutline"
                onClick={confirmDel.onClose}
                ref={cancelRef as any}
                fullWidth
              />
              <SharedButton
                label="حذف"
                variant="brandGradient"
                onClick={handleDelete}
                isLoading={del.isPending}
                fullWidth
              />
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------ أعمدة الجدول ------------------ */
const BANKS_COLUMNS: Column[] = [
  {
    key: "BankName",
    header: "اسم البنك",
    width: "auto",
    render: (row: AnyRec) => row.BankName ?? row.Bank_Name ?? "-",
  },
  { key: "__spacer", header: "", width: "35%", render: () => null },
];

/* ------------------ الصفحة الرئيسية ------------------ */
export default function Banks() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const limit =10;
  const offset = (page - 1) * limit;

  const addModal = useDisclosure();

  const { data, isLoading, isError, error, isFetching, refetch } =
    useBanksQuery(offset, limit);

  const addBank = useAddBank(toast);

  const banksData = data?.rows || [];
  console.log(data);
  
  console.log(data?.decrypted);
  
  const totalRows = Number(data?.decrypted?.data?.Result[0]?.BanksCount) || 1;

  const addFields: FieldConfig[] = [
    {
      name: "bankName",
      label: "اسم البنك",
      placeholder: "برجاء كتابة اسم البنك",
      required: true,
      type: "input",
      colSpan: 2,
    },
  ];

  const handleAddSubmit = async (vals: { bankName: string }) => {
    await addBank.mutateAsync({ bankName: vals.bankName });
    toast({ status: "success", title: "تمت الإضافة", description: "تمت إضافة البنك بنجاح" });
    addModal.onClose();
    refetch();
  };

  if (isLoading && !isFetching) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب البنوك: {error?.message}
      </Alert>
    );
  }

  return (
    <Box>
      <FormModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        title="إضافة بنك"
        fields={addFields}
        submitLabel="إضافة"
        cancelLabel="إلغاء"
        isSubmitting={addBank.isPending}
        onSubmit={handleAddSubmit}
      />

      <DataTable
        title="قائمة البنوك"
        data={banksData}
        columns={BANKS_COLUMNS}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        headerAction={
          <SharedButton
            variant="brandGradient"
            onClick={addModal.onOpen}
            leftIcon={
              <Box
                color="white"
                w="22px"
                h="22px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="700"
                lineHeight="1"
                fontSize="18px"
              >
                <AddIcon/>
              </Box>
            }
            isLoading={isFetching || addBank.isPending}
          >
            إضافة بنك
          </SharedButton>
        }
        totalRows={totalRows}
        renderActions={(row) => <RowActions row={row} onChanged={refetch} />}
      />
    </Box>
  );
}
