import { useMemo, useRef, useState } from "react";
import {
  Box, Switch, Text, Flex, Spinner, Alert, AlertIcon, useDisclosure,
  useToast, IconButton, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  HStack, Portal,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { DataTable } from "../../../Components/Table/DataTable";
import type { Column, AnyRec } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";
import { useCitiesQuery } from "./hooks/useCities";
import { useAddCity } from "./hooks/useAddCities";
import { useDeleteCity } from "./hooks/useDeleteCities";
import { useUpdateCities } from "./hooks/useUpdateCities";
import FormModal, { type FieldConfig } from "../../../Components/ModalAction/FormModel";

/** غيّر الاسم ده لاسم الحقل الصحيح عندك في الـ API (مثلاً "isActive" أو "Active") */
const STATUS_FIELD = "isActive" as const;

/** قائمة الإجراءات لكل صف */
function RowActions({
  row, onDeleted, onEdited,
}: { row: AnyRec; onDeleted: () => void; onEdited: (row: AnyRec) => void; }) {
  const toast = useToast();
  const del = useDeleteCity();
  const confirm = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    const id = row.Id ?? row.id ?? row.CityId ?? row.city_id;
    try {
      await del.mutateAsync(id);
      toast({ status: "success", title: "تم الحذف", description: "تم حذف المدينة بنجاح" });
      confirm.onClose();
      onDeleted();
    } catch (e: any) {
      toast({ status: "error", title: "فشل الحذف", description: e?.message || "حدث خطأ أثناء الحذف" });
    }
  };

  return (
    <>
      <Menu placement="bottom-start" isLazy strategy="fixed">
        <MenuButton
          as={IconButton}
          aria-label="إجراءات"
          icon={<BsThreeDotsVertical />}
          size="sm"
          variant="brandOutline"
          onClick={(e) => e.stopPropagation()}
        />
        <Portal>
          <MenuList>
            <MenuItem onClick={() => onEdited(row)}>تعديل</MenuItem>
            <MenuItem color="red.600" onClick={confirm.onOpen}>حذف</MenuItem>
          </MenuList>
        </Portal>
      </Menu>

      <AlertDialog isOpen={confirm.isOpen} leastDestructiveRef={cancelRef} onClose={confirm.onClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontWeight="700">حذف المدينة</AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من حذف “{row.CityName ?? row.name ?? row.title ?? "هذه المدينة"}”؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogBody>
          <AlertDialogFooter w="100%">
            <HStack w="100%" spacing={4} justify="space-around">
              <SharedButton label="إلغاء" variant="dangerOutline" onClick={confirm.onClose} ref={cancelRef as any} fullWidth />
              <SharedButton label="حذف" variant="brandGradient" onClick={handleDelete} isLoading={del.isPending} fullWidth />
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function Cities() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const limit = 8;
  const offset = (page - 1) * limit;

  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const [editingRow, setEditingRow] = useState<AnyRec | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useCitiesQuery(offset, limit);
  const addCity = useAddCity();
  const updateCity = useUpdateCities();

  const citiesData = data?.rows || [];
  const totalRows = data?.totalRows ?? 0;

  // 🔁 لودر للسويتش أثناء التحديث
  const [switchingId, setSwitchingId] = useState<number | string | null>(null);

  // ✅ تغيير الحالة (تفعيل/إلغاء)
  const handleToggleStatus = async (row: AnyRec, nextChecked: boolean) => {
    const id = row.Id ?? row.id ?? row.CityId ?? row.city_id;
    try {
      setSwitchingId(id);

      // كون الـ key ديناميكي لتفادي خطأ النوع (TS) لو النوع ثابت
      await updateCity.mutateAsync({
        id,
        [STATUS_FIELD]: nextChecked ? 1 : 0,
      } as any);

      toast({ status: "success", title: nextChecked ? "تم التفعيل" : "تم إلغاء التفعيل" });
      refetch();
    } catch (e: any) {
      toast({ status: "error", title: "فشل تحديث الحالة", description: e?.message || "" });
    } finally {
      setSwitchingId(null);
    }
  };

  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: "cityName", label: "اسم المدينة", placeholder: "برجاء كتابة اسم المدينة", required: true, type: "input", colSpan: 2 },
    ],
    []
  );

  // إضافة
  const handleAddSubmit = async (vals: { cityName: string }) => {
    await addCity.mutateAsync({ cityName: vals.cityName });
    toast({ status: "success", title: "تمت الإضافة", description: "تمت إضافة المدينة بنجاح" });
    addModal.onClose();
    refetch();
  };

  // تعديل
  const handleEditSubmit = async (vals: { cityName: string }) => {
    if (!editingRow) return;
    const id = editingRow.Id ?? editingRow.id ?? editingRow.CityId ?? editingRow.city_id;
    await updateCity.mutateAsync({ id, cityName: vals.cityName });
    toast({ status: "success", title: "تم التعديل", description: "تم تحديث المدينة بنجاح" });
    editModal.onClose();
    setEditingRow(null);
    refetch();
  };

  // ✅ أعمدة الجدول
  const CITIES_COLUMNS: Column[] = useMemo(
    () => [
      { key: "CityName", header: "اسم المدينة", width: "auto" },
      {
        key: "Status",
        header: "الحالة",
        width: "160px",
        render: (row: AnyRec) => {
          const isActive =
            row.Status === 1 || row.IsActive === 1 || row.Active === 1 || row.IsBlocked === 0;

          const hasStatus =
            row.Status !== undefined || row.IsActive !== undefined ||
            row.Active !== undefined || row.IsBlocked !== undefined;

          const id = row.Id ?? row.id ?? row.CityId ?? row.city_id;
          const loading = switchingId === id;

          return (
            <Flex align="center" gap="2" justify="flex-end" position="relative">
              {/* سبنر صغير فوق السويتش أثناء التحديث */}
              {loading && (
                <Spinner size="xs" position="absolute" left="-14px" />
              )}
              <Box opacity={loading ? 0.6 : 1}>
                <Switch
                  isChecked={!!isActive}
                  size="sm"
                  colorScheme="teal"
                  isDisabled={!hasStatus || loading}
                  onChange={(e) => handleToggleStatus(row, e.target.checked)}
                />
              </Box>
              <Text fontSize="sm" color={isActive ? "green.600" : "gray.600"}>
                {hasStatus ? (isActive ? "مفعل" : "غير مفعل") : "غير محدد"}
              </Text>
            </Flex>
          );
        },
      },
    ],
    [switchingId]
  );

  if (isLoading && !isFetching) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }

  if (isError) {
    return <Alert status="error" m={6}><AlertIcon />حدث خطأ أثناء جلب المدن: {error.message}</Alert>;
  }

  return (
    <Box p={6}>
      {/* مودال إضافة مدينة */}
      <FormModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        title="إضافة مدينة"
        fields={fields}
        submitLabel="إضافة"
        cancelLabel="إلغاء"
        isSubmitting={addCity.isPending}
        onSubmit={handleAddSubmit}
      />

      {/* مودال تعديل مدينة */}
      <FormModal
        isOpen={editModal.isOpen}
        onClose={() => { editModal.onClose(); setEditingRow(null); }}
        title="تعديل مدينة"
        fields={fields}
        initialValues={{ cityName: editingRow?.CityName ?? "" }}
        submitLabel="حفظ"
        cancelLabel="إلغاء"
        isSubmitting={updateCity.isPending}
        onSubmit={handleEditSubmit}
      />

      <DataTable
        title="المدن"
        data={citiesData}
        columns={CITIES_COLUMNS}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        headerAction={
          <SharedButton
            variant="brandGradient"
            onClick={addModal.onOpen}
            isLoading={isFetching || addCity.isPending}
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
            إضافة مدينة
          </SharedButton>
        }
        totalRows={totalRows}
        renderActions={(row) => (
          <RowActions
            row={row}
            onDeleted={refetch}
            onEdited={(r) => { setEditingRow(r); editModal.onOpen(); }}
          />
        )}
      />
    </Box>
  );
}
