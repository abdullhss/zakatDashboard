// src/features/sacrifices/SacrificeDataTypes.tsx
import React, { useMemo, useState, useCallback } from "react";
import { Box, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import DataTable from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import type { AnyRec } from "../../../api/apiClient";

import { useGetSacrifices } from "./hooks/useGetSacrificeTypes";
import { useAddSacrifice } from "./hooks/useAddSacrificeType";
import { useUpdateSacrifice } from "./hooks/useUpdateSacrifice";
import { useDeleteSacrifice } from "./hooks/useDeleteSacrificeType";

import SacrificeForm from "./components/SacrificeForm";
import DeleteDialog from "./components/DeleteDialog";
import { buildColumns } from "./components/columns";
import { mapApiRowsToSacrificeRows, pickTotalRows } from "./helpers/mapApiRows";
import type { SacrificeRow } from "./helpers/types";

const PAGE_SIZE = 25;

export default function SacrificeDataTypes() {
  const toast = useToast();
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const startNum = useMemo(() => Math.max(1, (page - 1) * PAGE_SIZE + 1), [page]);

  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const delModal = useDisclosure();

  const [editingRow, setEditingRow] = useState<SacrificeRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<SacrificeRow | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetSacrifices(startNum, PAGE_SIZE, true);
  const addSacrifice = useAddSacrifice();
  const updateSacrifice = useUpdateSacrifice();
  const deleteSacrifice = useDeleteSacrifice();

  const sourceRows = (data?.rows ?? []) as AnyRec[];
  const rows: SacrificeRow[] = useMemo(() => mapApiRowsToSacrificeRows(sourceRows), [sourceRows]);
  const totalRows = useMemo(() => pickTotalRows(data, rows.length), [data, rows.length]);

  const onEditRow = useCallback(
    (raw: AnyRec) => {
      const row = raw as SacrificeRow;
      if (!row.Id) return toast({ title: "لا يمكن تحديد السجل للتعديل", status: "warning" });
      setEditingRow(row);
      editModal.onOpen();
    },
    [editModal, toast]
  );

  const onDeleteRow = useCallback(
    (raw: AnyRec) => {
      const row = raw as SacrificeRow;
      if (!row.Id) return toast({ title: "لا يمكن تحديد السجل للحذف", status: "warning" });
      setDeletingRow(row);
      delModal.onOpen();
    },
    [delModal, toast]
  );

  /* ✅ تحقق من الاسم قبل الإضافة */
  const handleAddSubmit = useCallback(
    async (vals: { name: string; price: string | number; isActive?: boolean }) => {
      const name = vals.name.trim();

      const isDuplicate = rows.some((r) => r.Name?.toLowerCase() === name.toLowerCase());
      if (isDuplicate) {
        toast({
          status: "warning",
          title: "اسم مكرر",
          description: `الاسم "${name}" موجود بالفعل، يرجى اختيار اسم آخر.`,
        });
        return;
      }

      await addSacrifice.mutateAsync({
        name,
        price: Number(vals.price),
        isActive: !!vals.isActive,
      });
      toast({
        status: "success",
        title: "تمت الإضافة",
        description: "تمت إضافة نوع الأضحية بنجاح",
      });
      addModal.onClose();
      refetch();
    },
    [addSacrifice, addModal, refetch, rows, toast]
  );

  /* ✅ تعديل يشمل التفعيل والإلغاء */
  const handleEditSubmit = useCallback(
    async (vals: { name: string; price: string | number; isActive?: boolean }) => {
      if (!editingRow?.Id) return;

      await updateSacrifice.mutateAsync({
        id: editingRow.Id,
        name: vals.name.trim(),
        price: Number(vals.price),
        isActive: vals.isActive ?? editingRow.IsActive,
      });

      toast({
        status: "success",
        title: "تم التعديل",
        description: "تم تحديث بيانات النوع بنجاح",
      });
      editModal.onClose();
      setEditingRow(null);
      refetch();
    },
    [editingRow, refetch, toast, updateSacrifice, editModal]
  );

  const handleDelete = useCallback(
    async () => {
      if (!deletingRow?.Id) return;
      await deleteSacrifice.mutateAsync(deletingRow.Id);
      toast({
        status: "success",
        title: "تم الحذف",
        description: `تم حذف النوع \"${deletingRow.Name}\"`,
      });
      delModal.onClose();
      setDeletingRow(null);
      refetch();
    },
    [deleteSacrifice, deletingRow, delModal, refetch, toast]
  );

  const columns = useMemo(() => buildColumns(), []);

  if (isError) {
    return (
      <Box color="red.500" fontSize="sm">
        حدث خطأ: {(error as Error)?.message}
      </Box>
    );
  }

  return (
    <Box>
      {/* ✅ فورم الإضافة */}
      <SacrificeForm
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        title="إضافة نوع أضحية"
        mode="add"
        initialValues={{ name: "", price: "", isActive: true }}
        onSubmit={handleAddSubmit}
        isSubmitting={addSacrifice.isPending}
      />

      {/* ✅ فورم التعديل - أضفنا دعم حالة التفعيل */}
      <SacrificeForm
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.onClose();
          setEditingRow(null);
        }}
        title="تعديل نوع أضحية"
        mode="edit"
        initialValues={{
          name: editingRow?.Name ?? "",
          price: editingRow?.Price ?? "",
          isActive: editingRow?.IsActive ?? false, // ✅ تم إضافته هنا
        }}
        onSubmit={handleEditSubmit}
        isSubmitting={updateSacrifice.isPending}
      />

      {/* ✅ نافذة الحذف */}
      <DeleteDialog
        isOpen={delModal.isOpen}
        onClose={() => {
          delModal.onClose();
          setDeletingRow(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleteSacrifice.isPending}
        title="حذف نوع الأضحية"
        message={`هل أنت متأكد من حذف “${deletingRow?.Name ?? "هذا النوع"}”؟ لا يمكن التراجع عن هذا الإجراء.`}
      />

      {/* ✅ الجدول */}
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
        pageSize={25}
        onPageChange={setPage}
        headerAction={
          <SharedButton variant="brandGradient" onClick={addModal.onOpen}>
            + إضافة نوع
          </SharedButton>
        }
      />

      {!isLoading && rows.length === 0 && (
        <Text mt={3} color="gray.500">
          لا توجد بيانات.
        </Text>
      )}
    </Box>
  );
}
