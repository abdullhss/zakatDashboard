// src/features/SubventionTypes/SubventionTypes.tsx
import { useMemo, useState } from "react";
import { Box, Switch, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";
import FormModal from "../../../Components/ModalAction/FormModel";

import { useGetSubventionTypes } from "./hooks/useGetubventionTypes";
import { useAddSubventionType } from "./hooks/useAddSubvention";
import { useDeleteSubventionType } from "./hooks/useDeleteSubvention";
import { useUpdateSubventionStatus } from "./hooks/useUpdateSubvention"; 
type Row = {
  id: number | string;
  name: string;
  isActive: boolean;
};

const PAGE_SIZE = 10;

export default function SubventionTypes() {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const toast = useToast();

  // إضافة
  const addModal = useDisclosure();
  const addMutation = useAddSubventionType();

  // حذف
  const deleteModal = useDisclosure();
  const deleteMutation = useDeleteSubventionType();
  const [toDelete, setToDelete] = useState<Row | null>(null);

  // ✅ تحديث الحالة فقط
  const updateStatus = useUpdateSubventionStatus();

  // البيانات
  const { data, isLoading, isError, error } = useGetSubventionTypes(offset, PAGE_SIZE);

  const rows: Row[] = (data?.rows ?? []).map((r: AnyRec) => ({
    id: r.Id ?? r.id,
    name: r.SubventionTypeName ?? r.name ?? "",
    isActive: !!(r.IsActive ?? r.isActive),
  }));
  const totalRows = data?.totalRows ?? rows.length;

  // الأعمدة
  const columns: Column[] = useMemo(
    () => [
      {
        key: "name",
        header: "بيان التصنيف",
        width: "48%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.700">{(row as Row).name}</Text>
        ),
      },
      {
        key: "acceptZakat",
        header: "تقبل الزكاة",
        width: "20%",
        render: () => <Text color="gray.600">—</Text>, // (مش متاح من الـ API حالياً)
      },
      {
        key: "isActive",
        header: "حالة الخدمة",
        width: "20%",
        render: (row: AnyRec) => {
          const r = row as Row;
          const loading =
            updateStatus.isPending && updateStatus.variables?.id === r.id;

          return (
            <>
              <Switch
                isChecked={r.isActive}
                isDisabled={loading}
                mr={3}
                onChange={async (e) => {
                  const next = e.target.checked;
                  try {
                    await updateStatus.mutateAsync({ id: r.id, isActive: next, pointId: 0 });
                    toast({
                      status: "success",
                      title: next ? "تم تفعيل الخدمة" : "تم إلغاء التفعيل",
                    });
                  } catch (err: any) {
                    toast({
                      status: "error",
                      title: err?.message || "تعذّر تحديث الحالة.",
                    });
                  }
                }}
              />
              <Text as="span" color="gray.600">
                {r.isActive ? "مفعل" : "غير مفعل"}
              </Text>
            </>
          );
        },
      },
    ],
    [updateStatus.isPending, updateStatus.variables]
  );

  /* ========== الإضافة ========== */
  const openAdd = () => addModal.onOpen();

  const addFields = [
    {
      name: "name",
      label: "بيان التصنيف",
      placeholder: "برجاء كتابة بيان التصنيف",
      required: true,
      type: "input" as const,
      colSpan: 1,
      inputProps: { dir: "rtl" as const },
    },
    {
      name: "isActive",
      label: "حالة الخدمة",
      type: "switch" as const,
      colSpan: 1,
    },
  ] as const;

  const handleAddSubmit = async (values: any) => {
    try {
      await addMutation.mutateAsync({
        name: values?.name?.trim?.() || "",
        isActive: !!values?.isActive,
        desc: "",
        limit: 0,
        offices: "",
        pointId: 0,
      });

      toast({ status: "success", title: "تمت إضافة تصنيف الإعانة." });
      addModal.onClose();
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذر إضافة التصنيف." });
    }
  };

  /* ========== الحذف ========== */
  const openDelete = (row: Row) => {
    setToDelete(row);
    deleteModal.onOpen();
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast({ status: "success", title: "تم حذف التصنيف بنجاح." });
      deleteModal.onClose();
      setToDelete(null);
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذر حذف التصنيف." });
    }
  };

  if (isLoading) return <Text color="gray.600">جارِ التحميل…</Text>;
  if (isError) return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;

  return (
    <Box>
      <DataTable
        title="تصنيف الإعانات"
        data={rows as unknown as AnyRec[]}
        columns={columns}
        startIndex={offset + 1}
        page={page}
        pageSize={PAGE_SIZE}
        totalRows={totalRows}
        onPageChange={setPage}
        headerAction={
          <SharedButton
            variant="brandGradient"
            onClick={openAdd}
            leftIcon={
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
                rounded="sm"
              >
                ＋
              </Box>
            }
          >
            إضافة تصنيف إعانة
          </SharedButton>
        }
        onDeleteRow={(row: AnyRec) => openDelete(row as Row)}
      />

      {/* مودال الإضافة */}
     

      {/* مودال تأكيد الحذف */}
      <FormModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.onClose();
          setToDelete(null);
        }}
        title="حذف تصنيف إعانة"
        mode="confirm"
        description={
          <Text>
            سيتم حذف التصنيف:{" "}
            <Text as="span" fontWeight="bold">{toDelete?.name}</Text>
            . هل أنت متأكد؟
          </Text>
        }
        onConfirm={handleConfirmDelete}
        submitLabel="حذف"
        cancelLabel="إلغاء"
        isSubmitting={deleteMutation.isPending}
        maxW="520px"
      />
    </Box>
  );
}
