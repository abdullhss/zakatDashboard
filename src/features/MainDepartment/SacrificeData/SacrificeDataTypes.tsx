import { useMemo, useState, useCallback } from "react";
import {
  Box, HStack, VStack, Switch, Text, useToast, useDisclosure,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import type { AnyRec } from "../../../api/apiClient";
import FormModal, { type FieldConfig } from "../../../Components/ModalAction/FormModel";

import { useGetSacrifices } from "./hooks/useGetSacrificeTypes";
import { useAddSacrifice } from "./hooks/useAddSacrificeType";
import { useUpdateSacrifice } from "./hooks/useUpdateSacrifice";
import { useDeleteSacrifice } from "./hooks/useDeleteSacrificeType";

type SacrificeRow = {
  Id: number | string;
  Name: string;
  Price: number | null;
  IsActive: boolean;
};

const PAGE_SIZE = 25;

function formatEGP(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try {
    return Number(n).toLocaleString("ar-EG", { maximumFractionDigits: 0 }) + " ج.م";
  } catch {
    return `${n} ج.م`;
  }
}

export default function SacrificeDataTypes() {
  const toast = useToast();
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const startNum = useMemo(() => Math.max(1, (page - 1) * PAGE_SIZE + 1), [page]);

  // مودالات
  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const delModal = useDisclosure();

  const [editingRow, setEditingRow] = useState<SacrificeRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<SacrificeRow | null>(null);

  const { data, isLoading, isError, error, refetch } =
    useGetSacrifices(startNum, PAGE_SIZE, true);

  const addSacrifice = useAddSacrifice();
  const updateSacrifice = useUpdateSacrifice();
  const deleteSacrifice = useDeleteSacrifice();

  const sourceRows = (data?.rows ?? []) as AnyRec[];

  const rows: SacrificeRow[] = useMemo(() => {
    return sourceRows.map((r: AnyRec) => ({
      Id:
        r.Id ?? r.SacrificeTypeId ?? r.TypeId ?? r.Code ?? r.id ?? r.code ??
        Math.random().toString(36).slice(2),
      Name: (r.SacrificeTypeName ?? r.TypeName ?? r.Name ?? r.name ?? "—") as string,
      Price: r.SacrificeTypePrice != null ? Number(r.SacrificeTypePrice) : null,
      IsActive: Boolean(r.IsActive ?? r.Active ?? r.isActive ?? true),
    }));
  }, [sourceRows]);

  const totalRows = useMemo(() => {
    if (typeof data?.totalRows === "number") return data.totalRows;
    const cnt =
      (data as any)?.row?.SacrificeTypesCount ??
      (data as any)?.row?.sacrificetypescount ??
      (data as any)?.row?.TotalRowsCount ??
      (data as any)?.row?.totalRowsCount;
    const n = Number(cnt);
    return Number.isFinite(n) ? n : rows.length;
  }, [data, rows.length]);

  // فتح تعديل
  const onEditRow = useCallback(
    (raw: AnyRec) => {
      const row = raw as SacrificeRow;
      if (!row.Id) {
        toast({ title: "لا يمكن تحديد السجل للتعديل", status: "warning" });
        return;
      }
      setEditingRow(row);
      editModal.onOpen();
    },
    [editModal, toast]
  );

  // فتح تأكيد حذف
  const onDeleteRow = useCallback(
    (raw: AnyRec) => {
      const row = raw as SacrificeRow;
      if (!row.Id) {
        toast({ title: "لا يمكن تحديد السجل للحذف", status: "warning" });
        return;
      }
      setDeletingRow(row);
      delModal.onOpen();
    },
    [delModal, toast]
  );

  const onRefresh = useCallback(() => {
    refetch();
    toast({ title: "تم تحديث القائمة", status: "success", duration: 1200 });
  }, [refetch, toast]);

  // حقول إضافة
  const addFields: FieldConfig[] = useMemo(
    () => [
      { name: "name", label: "اسم النوع", placeholder: "مثال: حري", required: true, inputProps: { dir: "rtl" } },
      { name: "price", label: "السعر", placeholder: "مثال: 9000", required: true, inputProps: { type: "number", inputMode: "numeric", min: 0 } },
      { name: "isActive", label: "مفعّل", type: "switch", colSpan: 2 },
    ],
    []
  );

  // حقول تعديل (اسم + سعر فقط)
  const editFields: FieldConfig[] = useMemo(
    () => [
      { name: "name", label: "اسم النوع", required: true, inputProps: { dir: "rtl" } },
      { name: "price", label: "السعر", required: true, inputProps: { type: "number", inputMode: "numeric", min: 0 } },
    ],
    []
  );

  // إضافة
  const handleAddSubmit = useCallback(
    async (vals: { name: string; price: string | number; isActive?: boolean }) => {
      await addSacrifice.mutateAsync({
        name: vals.name.trim(),
        price: Number(vals.price),
        isActive: !!vals.isActive,
      });
      toast({ status: "success", title: "تمت الإضافة", description: "تمت إضافة نوع الأضحية بنجاح" });
      addModal.onClose();
      refetch();
    },
    [addSacrifice, addModal, refetch, toast]
  );

  // تعديل
  const handleEditSubmit = useCallback(
    async (vals: { name: string; price: string | number }) => {
      if (!editingRow?.Id) return;
      await updateSacrifice.mutateAsync({
        id: editingRow.Id,
        name: vals.name.trim(),
        price: Number(vals.price),
        isActive: editingRow.IsActive, // لا نغيّر الحالة
      });
      toast({ status: "success", title: "تم التعديل", description: "تم تحديث بيانات النوع" });
      editModal.onClose();
      setEditingRow(null);
      refetch();
    },
    [editingRow, refetch, toast, updateSacrifice, editModal]
  );

  // تأكيد الحذف → نادى الـAPI
  const handleDelete = useCallback(
    async () => {
      if (!deletingRow?.Id) return;
      await deleteSacrifice.mutateAsync(deletingRow.Id);
      toast({ status: "success", title: "تم الحذف", description: `تم حذف النوع "${deletingRow.Name}"` });
      delModal.onClose();
      setDeletingRow(null);
      refetch();
    },
    [deleteSacrifice, deletingRow, delModal, refetch, toast]
  );

  const columns = useMemo(
    () => [
      {
        key: "Name",
        header: "اسم النوع",
        width: "44%",
        render: (r: AnyRec) => (
          <Text fontWeight="600" color="gray.700">
            {(r as SacrificeRow).Name}
          </Text>
        ),
      },
      {
        key: "Price",
        header: "السعر",
        width: "20%",
        align: "center",
        render: (r: AnyRec) => (
          <Text color="gray.700">{formatEGP((r as SacrificeRow).Price)}</Text>
        ),
      },
      {
        key: "IsActive",
        header: "الحالة",
        width: "18%",
        align: "center",
        render: (r: AnyRec) => {
          const row = r as SacrificeRow;
          return (
            <VStack spacing={1} align="center">
              <Switch isChecked={row.IsActive} isReadOnly />
              <Text as="span" fontSize="sm" color="gray.600">
                {row.IsActive ? "مفعّل" : "غير مفعّل"}
              </Text>
            </VStack>
          );
        },
      },
    ],
    []
  );

  if (isError) {
    return (
      <Box color="red.500" fontSize="sm">
        حدث خطأ: {(error as Error)?.message}
      </Box>
    );
  }

  return (
    <Box>
      {/* مودال إضافة */}
      <FormModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        title="إضافة نوع أضحية"
        fields={addFields}
        initialValues={{ name: "", price: "", isActive: true }}
        submitLabel="إضافة"
        cancelLabel="إلغاء"
        isSubmitting={addSacrifice.isPending}
        onSubmit={handleAddSubmit}
        maxW="600px"
      />

      {/* مودال تعديل */}
      <FormModal
        isOpen={editModal.isOpen}
        onClose={() => { editModal.onClose(); setEditingRow(null); }}
        title="تعديل نوع أضحية"
        fields={editFields}
        initialValues={{
          name: editingRow?.Name ?? "",
          price: editingRow?.Price ?? "",
        }}
        submitLabel="حفظ"
        cancelLabel="إلغاء"
        isSubmitting={updateSacrifice.isPending}
        onSubmit={handleEditSubmit}
        maxW="600px"
      />

      {/* مودال تأكيد حذف */}
      <AlertDialog isOpen={delModal.isOpen} onClose={() => { delModal.onClose(); setDeletingRow(null); }} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontWeight="700">حذف نوع الأضحية</AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من حذف “{deletingRow?.Name ?? "هذا النوع"}”؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack w="100%" spacing={4} justify="space-around">
              <Button onClick={() => { delModal.onClose(); setDeletingRow(null); }} variant="outline">إلغاء</Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={deleteSacrifice.isPending}>حذف</Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable
        title="أنواع الأضاحي"
        data={rows as unknown as AnyRec[]}
        columns={columns}
        totalRows={totalRows}
        stickyHeader
        loading={isLoading}
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        headerAction={
 
            <SharedButton variant="brandGradient" onClick={addModal.onOpen} leftIcon={
                <Box 
                         bg="white"
                color="brand.900"
                w="22px"
                h="22px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="700"
                lineHeight="1"
                fontSize="18px"
                rounded="sm">
                    +
                </Box>
            } >
              إضافة نوع
            </SharedButton>

        }
      />

      {!isLoading && rows.length === 0 && (
        <Text mt={3} color="gray.500">لا توجد بيانات.</Text>
      )}
    </Box>
  );
}
