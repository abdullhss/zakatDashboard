import { useMemo, useState } from "react";
import {
  Box, Switch, Text, useDisclosure, useToast,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Flex
} from "@chakra-ui/react";
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
  acceptZakat?: boolean;
};

const PAGE_SIZE = 10;

function boolish(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return ["true", "1", "yes", "نعم"].includes(s);
  }
  return !!v;
}

export default function SubventionTypes() {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const toast = useToast();

  // إضافة
  const addModal = useDisclosure();
  const addMutation = useAddSubventionType();

  // إدارة (تعديل) — هنستخدم نفس الهوك الموحد
  const manageModal = useDisclosure();
  const manageMutation = useUpdateSubventionStatus();
  const [editRow, setEditRow] = useState<Row | null>(null);

  // حذف
  const deleteModal = useDisclosure();
  const deleteMutation = useDeleteSubventionType();
  const [toDelete, setToDelete] = useState<Row | null>(null);

  // تحديث الحالة عبر السويتش داخل الصف (ممكن تستخدم نفس الهوك مرتين)
  const updateStatus = useUpdateSubventionStatus();

  // البيانات
  const { data, isLoading, isError, error } = useGetSubventionTypes(offset, PAGE_SIZE);

  const rows: Row[] = (data?.rows ?? []).map((r: AnyRec) => ({
    id: r.Id ?? r.id,
    name: r.SubventionTypeName ?? r.name ?? "",
    isActive: !!(r.IsActive ?? r.isActive),
    acceptZakat: boolish(
      r.AllowZakat ??
      r.allowZakat ??
      r.AcceptZakat ??
      r.acceptZakat ??
      r.IsZakat ??
      r.isZakat ??
      false
    ),
  }));
  const totalRows = data?.totalRows ?? rows.length;

  const openAdd = () => addModal.onOpen();
  const openEdit = (row: Row) => { setEditRow(row); manageModal.onOpen(); };
  const openDelete = (row: Row) => { setToDelete(row); deleteModal.onOpen(); };

  const columns: Column[] = useMemo(
    () => [
      {
        key: "name",
        header: "بيان التصنيف",
        width: "34%",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.700">
            {(row as Row).name}
          </Text>
        ),
      },
      {
        key: "acceptZakat",
        header: "تقبل الزكاة",
        width: "18%",
        render: (row: AnyRec) => {
          const accept = boolish(
            (row as Row)?.acceptZakat ??
            row.AllowZakat ??
            row.acceptZakat ??
            row.AcceptZakat ??
            row.IsZakat ??
            false
          );
          return (
            <Text color={accept ? "green.600" : "red.500"} fontWeight="600" textAlign="center">
              {accept ? "نعم" : "لا"}
            </Text>
          );
        },
      },
      {
        key: "isActive",
        header: "حالة الخدمة",
        width: "20%",
        render: (row: AnyRec) => {
          const r = row as Row;
          const loading = updateStatus.isPending && updateStatus.variables?.id === r.id;

          return (
            <Flex alignItems="center">
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
            </Flex>
          );
        },
      },
      {
        key: "actions",
        header: "الإجراءات",
        width: "8%",
        render: (row: AnyRec) => {
          const r = row as Row;
          return (
            <Menu placement="bottom-end" isLazy>
              <MenuButton
                as={IconButton}
                aria-label="إجراءات"
                variant="ghost"
                size="sm"
                rounded="md"
              >
                <Box as="span" fontSize="20px" lineHeight="1">⋮</Box>
              </MenuButton>
              <MenuList zIndex={10}>
                <MenuItem onClick={() => openEdit(r)}>تعديل</MenuItem>
                <MenuItem
                  onClick={async () => {
                    try {
                      await manageMutation.mutateAsync({
                        id: r.id,
                        isActive: !r.isActive,
                      });
                      toast({
                        status: "success",
                        title: !r.isActive ? "تم تفعيل الخدمة" : "تم إلغاء التفعيل",
                      });
                    } catch (e: any) {
                      toast({ status: "error", title: e?.message || "تعذّر تحديث الحالة." });
                    }
                  }}
                >
                  {/* {r.isActive ? "إلغاء التفعيل" : "تفعيل"} */}
                </MenuItem>
                <MenuItem color="red.500" onClick={() => openDelete(r)}>حذف</MenuItem>
              </MenuList>
            </Menu>
          );
        },
      },
    ],
    [updateStatus.isPending, updateStatus.variables, manageMutation.isPending]
  );

  // حقول مودال "إضافة"
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
      defaultValue: true,
      
    },
    {
      name: "acceptZakat",
      label: "تقبل الزكاة",
      type: "switch" as const,
      colSpan: 1,
      defaultValue: false,
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
        allowZakat: !!values?.acceptZakat,
        pointId: 0 as any,
      } as any);

    toast({ status: "success", title: "تمت إضافة تصنيف الإعانة." });
    addModal.onClose();
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذّر إضافة التصنيف." });
    }
  };

  // مودال "تعديل" — نفس الحقول
  const manageFields = addFields;

  const handleManageSubmit = async (values: any) => {
    if (!editRow) return;
    try {
      await manageMutation.mutateAsync({
        id: editRow.id,
        name: values?.name?.trim?.() || "",
        isActive: !!values?.isActive,
        allowZakat: !!values?.acceptZakat,
        pointId: 0,
      });
      toast({ status: "success", title: "تم حفظ التعديلات." });
      manageModal.onClose();
      setEditRow(null);
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذّر حفظ التعديلات." });
    }
  };

  // حذف
  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast({ status: "success", title: "تم حذف التصنيف بنجاح." });
      deleteModal.onClose();
      setToDelete(null);
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذّر حذف التصنيف." });
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
        // onDeleteRow={(row: AnyRec) => openDelete(row as Row)}
      />

      {/* مودال الإضافة */}
      <FormModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        title="إضافة تصنيف إعانة"
        mode="form"
        fields={addFields}
        onSubmit={handleAddSubmit}
        submitLabel="حفظ"
        cancelLabel="إلغاء"
        isSubmitting={addMutation.isPending}
        maxW="640px"
      />

      {/* مودال التعديل من 3 نقاط */}
      <FormModal
        isOpen={manageModal.isOpen}
        onClose={() => { manageModal.onClose(); setEditRow(null); }}
        title="تعديل تصنيف"
        mode="form"
        fields={manageFields}
        onSubmit={handleManageSubmit}
        submitLabel="حفظ التعديلات"
        cancelLabel="إلغاء"
        initialValues={editRow ? {
          name: editRow.name,
          isActive: editRow.isActive,
          acceptZakat: !!editRow.acceptZakat,
        } : undefined}
        isSubmitting={manageMutation.isPending}
        maxW="640px"
      />

      {/* مودال تأكيد الحذف */}
      <FormModal
        isOpen={deleteModal.isOpen}
        onClose={() => { deleteModal.onClose(); setToDelete(null); }}
        title="حذف تصنيف إعانة"
        mode="confirm"
        description={
          <Text>
            سيتم حذف التصنيف:{" "}
            <Text as="span" fontWeight="bold">
              {toDelete?.name}
            </Text>
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
