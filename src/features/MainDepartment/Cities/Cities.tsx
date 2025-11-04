import { useMemo, useRef, useState } from "react";
import {
  Box, Flex, Spinner, Alert, AlertIcon, useDisclosure,
  useToast, IconButton, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  HStack, Portal,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";
import { useCitiesQuery } from "./hooks/useCities";
import { useAddCity } from "./hooks/useAddCities";
import { useDeleteCity } from "./hooks/useDeleteCities";
import { useUpdateCities } from "./hooks/useUpdateCities";
import FormModal, { type FieldConfig } from "../../../Components/ModalAction/FormModel";

// ⚠️ تأكد من المسار حسب مشروعك (قد يكون: "../Offices/Services/getOffice")
import { getOffices } from "../Offices/Services/getOffice";

/** دالة مساعدة: هل هناك مكاتب مرتبطة بهذه المدينة؟ */
async function hasOfficesInCity(cityId: number | string): Promise<boolean> {
  const PAGE = 200;
  let offset = 0;

  while (true) {
    const res = await getOffices(offset, PAGE);
    const rows = res?.rows ?? [];
    if (!rows.length) return false;

    const found = rows.some((r: AnyRec) => {
      const rid = r.CityId ?? r.cityId ?? r.City_Id ?? r.city_id ?? r.CityID;
      return Number(rid) === Number(cityId);
    });
    if (found) return true;

    offset += rows.length;
    if (rows.length < PAGE) return false;
  }
}

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
      const linked = await hasOfficesInCity(id);
      if (linked) {
        toast({
          status: "warning",
          title: "لا يمكن الحذف",
          description: "لا يمكن حذف هذه المدينة لأنها مرتبطة بمكتب.",
          duration: 6000,
          isClosable: true,
        });
        confirm.onClose();
        return;
      }

      await del.mutateAsync(id);
      toast({ status: "success", title: "تم الحذف", description: "تم حذف المدينة بنجاح" });
      confirm.onClose();
      onDeleted();
    } catch (e: any) {
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
          description: "لا يمكن حذف هذه المدينة لأنها مرتبطة بمكتب.",
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          status: "error",
          title: "فشل الحذف",
          description: msg || "حدث خطأ أثناء الحذف",
          duration: 6000,
          isClosable: true,
        });
      }
      confirm.onClose();
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

  const [page] = useState(1);
  const limit = 1000;
  const offset = 0;

  const addModal = useDisclosure();
  const editModal = useDisclosure();
  const [editingRow, setEditingRow] = useState<AnyRec | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = useCitiesQuery(offset, limit);
  const addCity = useAddCity();
  const updateCity = useUpdateCities();

  const citiesData = data?.rows || [];
  const totalRows = data?.totalRows ?? 0;

  const fields = useMemo<FieldConfig[]>(
    () => [
      { name: "cityName", label: "اسم المدينة", placeholder: "برجاء كتابة اسم المدينة", required: true, type: "input", colSpan: 2 },
    ],
    []
  );

  const handleAddSubmit = async (vals: { cityName: string }) => {
    const newCityName = vals.cityName.trim();
    const isDuplicate = citiesData.some(
      (city) =>
        (city.CityName ?? city.name ?? city.title)?.toLowerCase() === newCityName.toLowerCase(),
    );

    if (isDuplicate) {
      toast({
        status: "warning",
        title: "فشل الإضافة",
        description: `المدينة ${newCityName} موجودة بالفعل.`,
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await addCity.mutateAsync({ cityName: newCityName });
      toast({ status: "success", title: "تمت الإضافة", description: "تمت إضافة المدينة بنجاح" });
      addModal.onClose();
      refetch();
    } catch (e: any) {
      toast({
        status: "error",
        title: "فشل الإضافة",
        description: e?.message || "حدث خطأ أثناء إضافة المدينة",
      });
    }
  };

  const handleEditSubmit = async (vals: { cityName: string }) => {
    if (!editingRow) return;
    const id = editingRow.Id ?? editingRow.id ?? editingRow.CityId ?? editingRow.city_id;

    const newCityName = vals.cityName.trim();
    const isDuplicate = citiesData.some(
      (city) =>
        (city.Id ?? city.id ?? city.CityId ?? city.city_id) !== id &&
        (city.CityName ?? city.name ?? city.title)?.toLowerCase() === newCityName.toLowerCase(),
    );

    if (isDuplicate) {
      toast({
        status: "warning",
        title: "فشل التعديل",
        description: `المدينة ${newCityName} موجودة بالفعل.`,
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateCity.mutateAsync({ id, cityName: newCityName });
      toast({ status: "success", title: "تم التعديل", description: "تم تحديث المدينة بنجاح" });
      editModal.onClose();
      setEditingRow(null);
      refetch();
    } catch (e: any) {
      toast({
        status: "error",
        title: "فشل التعديل",
        description: e?.message || "حدث خطأ أثناء تحديث المدينة",
      });
    }
  };

  const CITIES_COLUMNS: Column[] = useMemo(
    () => [
      {
        key: "CityName",
        header: "اسم المدينة",
        render: (row: AnyRec) => row.CityName ?? row.name ?? "-",
      },

    ],
    []
  );

  if (isLoading && !isFetching) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }

  if (isError) {
    return <Alert status="error" m={6}><AlertIcon />حدث خطأ أثناء جلب المدن: {(error as Error)?.message}</Alert>;
  }

  return (
    <Box p={6}>
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
        pageSize={limit}
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
