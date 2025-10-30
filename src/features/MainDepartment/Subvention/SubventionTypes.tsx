import { useMemo, useRef, useState } from "react";
import {
  Box, Switch, Text, useDisclosure, useToast,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Flex,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  HStack, Portal, Button,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";
import FormModal from "../../../Components/ModalAction/FormModel";
import { useGetSubventionTypes } from "./hooks/useGetubventionTypes";
import { useAddSubventionType } from "./hooks/useAddSubvention";
import { useUpdateSubventionStatus } from "./hooks/useUpdateSubvention";

// ✅ استيراد خدمة المشاريع (عدّل المسار لو مختلف عندك)
import { fetchProjects } from "../../OfficeDashboard/Projects/Services/getProjects";

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

/* =======================
   Helpers: مشروع مرتبط؟
   ======================= */

// بنحاول نقرأ معرّف التصنيف من صف المشروع
function pickSubventionTypeIdFromProjectRow(r: AnyRec): string | number | null {
  const keys = [
    "SubventionTypeId",
    "SubventionType_Id",
    "TypeId",
    "AidTypeId",
    "SubTypeId",
    "subventionTypeId",
    "subvention_type_id",
  ];
  for (const k of keys) {
    const v = r?.[k];
    if (v != null && String(v).trim() !== "") return v;
  }
  return null;
}

// شيك لو التصنيف مرتبط بأي مشروع (N/C/S)
async function isSubventionTypeLinkedToAnyProject(subventionTypeId: number | string): Promise<boolean> {
  const COUNT = 500; // غطّي عدد كافي
  const types: Array<"N" | "C" | "S"> = ["N", "C", "S"];

  for (const t of types) {
    const res = await fetchProjects(t, 0, COUNT);
    const rows = (res?.rows ?? []) as AnyRec[];
    const found = rows.some((pr) => String(pickSubventionTypeIdFromProjectRow(pr)) === String(subventionTypeId));
    if (found) return true;
  }
  return false;
}

/** 🚨 المكون: إجراءات الصف (مع تأكيد) 🚨 */
function SubventionRowActions({
  row, onDeleted, onEdited, onStatusToggle,
}: {
  row: Row;
  onDeleted: () => void;
  onEdited: (row: Row) => void;
  onStatusToggle: (row: Row, forceDeactivateFromMenu?: boolean) => Promise<void>;
}) {
  const toast = useToast();
  const confirm = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const updateStatus = useUpdateSubventionStatus(); // لعرض حالة التحميل

  // في منيو "حذف" = إلغاء تفعيل مع فحص الارتباط
  const handleDelete = async () => {
    try {
      await onStatusToggle(row, true); // true => جاي من الحذف (إلغاء تفعيل)
      toast({
        status: "success",
        title: "تم تنفيذ الإجراء",
        description: `تم إلغاء تفعيل التصنيف "${row.name}" (إن لم يكن مرتبطًا بمشروعات).`,
      });
      confirm.onClose();
    } catch (e: any) {
      // onStatusToggle بيتولى عرض التوست المناسب في حال الارتباط
      confirm.onClose();
    }
  };

  const isHandlingStatus = updateStatus.isPending && updateStatus.variables?.id === row.id;

  return (
    <>
      <Menu placement="bottom-end" isLazy>
        <MenuButton
          as={IconButton}
          aria-label="إجراءات"
          icon={<BsThreeDotsVertical />}
          size="sm"
          variant="ghost"
          rounded="md"
          onClick={(e) => e.stopPropagation()}
        />
        <Portal>
          <MenuList zIndex={10}>
            <MenuItem onClick={() => onEdited(row)}>تعديل</MenuItem>
            <MenuItem color="red.500" onClick={confirm.onOpen}>حذف</MenuItem>
          </MenuList>
        </Portal>
      </Menu>

      <AlertDialog isOpen={confirm.isOpen} leastDestructiveRef={cancelRef} onClose={confirm.onClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontWeight="700">تأكيد الإجراء</AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من إلغاء تفعيل “{row.name}”؟ سيتم التحقق أولًا أنه غير مرتبط بمشروعات.
          </AlertDialogBody>
          <AlertDialogFooter w="100%">
            <HStack w="100%" spacing={4} justify="space-around">
              <SharedButton label="إلغاء" variant="dangerOutline" onClick={confirm.onClose} ref={cancelRef as any} fullWidth />
              <SharedButton
                label="إلغاء التفعيل"
                variant="brandGradient"
                onClick={handleDelete}
                isLoading={isHandlingStatus}
                fullWidth
              />
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --------------------------------------------------------------------------

export default function SubventionTypes() {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const toast = useToast();

  // إضافة
  const addModal = useDisclosure();
  const addMutation = useAddSubventionType();

  // إدارة (تعديل)
  const manageModal = useDisclosure();
  const manageMutation = useUpdateSubventionStatus();
  const [editRow, setEditRow] = useState<Row | null>(null);

  // تحديث الحالة
  const updateStatus = useUpdateSubventionStatus();

  // البيانات
  const { data, isLoading, isError, error, refetch } = useGetSubventionTypes(offset, PAGE_SIZE);

  const rows: Row[] = (data?.rows ?? []).map((r: AnyRec) => ({
    id: r.Id ?? r.id,
    name: r.SubventionTypeName ?? r.name ?? "",
    isActive: !!(r.IsActive ?? r.isActive),
    acceptZakat: boolish(
      r.AllowZakat ?? r.allowZakat ?? r.AcceptZakat ?? r.acceptZakat ?? r.IsZakat ?? r.isZakat ?? false
    ),
  }));
  const totalRows = data?.totalRows ?? rows.length;

  const openAdd = () => addModal.onOpen();
  const openEdit = (row: Row) => { setEditRow(row); manageModal.onOpen(); };

  // ✅ وظيفة موحدة لتفعيل/إلغاء التفعيل مع فحص الارتباط عند الإلغاء
  const handleStatusToggle = async (row: Row, forceDeactivateFromMenu = false) => {
    try {
      const next = forceDeactivateFromMenu ? false : !row.isActive;

      // لو هنلغي التفعيل → شيّك الارتباط بالمشروعات
      if (row.isActive && !next) {
        const linked = await isSubventionTypeLinkedToAnyProject(row.id);
        if (linked) {
          toast({
            status: "warning",
            title: "لا يمكن إلغاء التفعيل",
            description: "هذا التصنيف مرتبط بمشروعات قائمة (N/C/S). قم بفك الارتباط أولًا.",
            duration: 4500,
            isClosable: true,
          });
          throw new Error("Subvention type is linked to projects.");
        }
      }

      await updateStatus.mutateAsync({ id: row.id, isActive: next, pointId: 0 });
      toast({
        status: "success",
        title: next ? "تم تفعيل الخدمة" : "تم إلغاء التفعيل",
      });
      refetch();
    } catch (err: any) {
      if (!/linked to projects/i.test(err?.message || "")) {
        toast({
          status: "error",
          title: err?.message || "تعذّر تحديث الحالة.",
        });
      }
    }
  };

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

  const manageFields = addFields;

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
      await refetch();
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذّر إضافة التصنيف." });
    }
  };

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
      await refetch();
    } catch (e: any) {
      toast({ status: "error", title: e?.message || "تعذّر حفظ التعديلات." });
    }
  };

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
            row.isZakat ??
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
                onChange={() => handleStatusToggle(r)} // فيه فحص ارتباط عند الإلغاء
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
            <SubventionRowActions
              row={r}
              onDeleted={refetch}
              onEdited={openEdit}
              onStatusToggle={handleStatusToggle}
            />
          );
        },
      },
    ],
    [updateStatus.isPending, updateStatus.variables, manageMutation.isPending, refetch]
  );

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

      {/* مودال التعديل */}
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
    </Box>
  );
}
