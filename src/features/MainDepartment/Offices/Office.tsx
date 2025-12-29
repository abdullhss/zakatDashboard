import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Text, Switch, HStack, useDisclosure, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, IconButton, Menu,
  MenuButton, MenuList, MenuItem, Portal, Flex, Spinner, Alert, AlertIcon, Button,
  Select
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import SharedButton from "../../../Components/SharedButton/Button";

import { useGetOffices } from "./hooks/useGetOffices";
import { useDeleteOffice } from "./hooks/useDeleteOffice";
import { getCities } from "../Cities/Services/getCities";

/* ---------------- types ---------------- */
type OfficeRow = {
  id: number;
  companyName: string;
  phone: string;
  city: string;
  isActive: boolean;
  photoName?: string | number;
};

/* --------------- utils --------------- */
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

/* -------- Row actions (3-dots menu) -------- */
function RowActions({
  row,
  onDeleted,
  onEdited,
}: {
  row: OfficeRow;
  onDeleted: () => void;
  onEdited: (row: OfficeRow) => void;
}) {
  const toast = useToast();
  const confirm = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { hardDelete, softDeactivate } = useDeleteOffice();

  const handleDelete = async () => {
    try {
      const res = await hardDelete.mutateAsync(row.id);
      if (res.flags.FAILURE || res.flags.INTERNAL_ERROR) {
        toast({
          title: res.message || "تعذّر الحذف بسبب وجود علاقات مرتبطة.",
          description: "سنحاول تعطيل السجل بدلًا من حذفه.",
          status: "warning",
          duration: 2500,
          isClosable: true,
        });
        const soft = await softDeactivate.mutateAsync(row.id);
        if (soft.flags.FAILURE || soft.flags.INTERNAL_ERROR) {
          throw new Error(soft.message || "فشل التعطيل.");
        }
        toast({ title: "تم تعطيل المكتب بدلًا من حذفه.", status: "success" });
      } else {
        toast({ title: "تم حذف المكتب.", status: "success" });
      }
      confirm.onClose();
      onDeleted();
    } catch (e: any) {
      toast({
        title: "حدث خطأ أثناء العملية.",
        description: e?.message,
        status: "error",
      });
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
          <AlertDialogHeader fontWeight="700">حذف المكتب</AlertDialogHeader>
          <AlertDialogBody>
            هل أنت متأكد من حذف “{row.companyName}”؟ قد يتم التعطيل بدلًا من الحذف إذا كانت هناك علاقات مرتبطة.
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack w="100%" spacing={3} justify="space-around">
              <Button ref={cancelRef} onClick={confirm.onClose} variant="outline">إلغاء</Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={hardDelete.isPending || softDeactivate.isPending}>
                حذف
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* --------------- main component --------------- */
export default function Office() {
  const navigate = useNavigate();
  const toast = useToast();

  const userId = getCurrentUserId();
  const [cities, setCities] = useState<any[]>([]) ; 
  const [selectedCity , setSelectedCity] = useState(0); 

  const [page, setPage] = useState(1);
  const limit =10;
  const offset = (page - 1) * limit;
  useEffect(()=>{
    getcities() ;
  } , [])
  const getcities = async ()=>{
    const res = await getCities(1 , 1000);
    setCities(res.rows);
  }  
  

  // ✅ استدعاء كل المكاتب مرة واحدة (من غير pagination)
  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetOffices(offset , limit, selectedCity);
    
    const totalRows = Number(data?.decrypted.data.Result[0].OfficesCount) || 1;
    const offciesData = data?.decrypted.data.Result[0].OfficesData ? JSON.parse(data?.decrypted.data.Result[0].OfficesData) : [];
    
  const rows = useMemo<OfficeRow[]>(() => {
    const src = (data?.rows as AnyRec[]) ?? [];
    return src.map((r) => ({
      id: Number(r.Id ?? r.OfficeId ?? r.id ?? 0),
      companyName: String(r.OfficeName ?? r.CompanyName ?? r.Name ?? "—"),
      phone: String(r.PhoneNum ?? r.Phone ?? r.phone ?? ""),
      city: String(r.CityName ?? r.City ?? r.city ?? "—"),
      isActive: Boolean(r.IsActive ?? r.Active ?? r.isActive ?? false),
      photoName: String(r.OfficePhotoName ?? r.OfficePhotoName_Id ?? r.photoName ?? ""),
    }));
  }, [data?.rows]);

  const serverMessage = data?.message || "";

  const columns: Column[] = useMemo(
    () => [
      {
        key: "officeName",
        header: "اسم المكتب",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.700">
            {(row as OfficeRow).companyName}
          </Text>
        ),
      },
      {
        key: "phone",
        header: "رقم الهاتف",
        render: (row: AnyRec) => <Text>{(row as OfficeRow).phone}</Text>,
      },
      { key: "city", header: "المدينة" },
      {
        key: "isActive",
        header: <Box w="full" textAlign="center">الحالة</Box>,
        render: (row: AnyRec) => {
          const r = row as OfficeRow;
          return (
            <HStack justify="center" spacing={2}>
              <Text color="gray.600">{r.isActive ? "مفعل" : "غير مفعل"}</Text>
            </HStack>
          );
        },
      },
    ],
    []
  );

  if (isLoading && !isFetching) {
    return (
      <Flex justify="center" p={10}><Spinner size="xl" /></Flex>
    );
  }

  return (
    <Box>
      {isError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          حدث خطأ أثناء جلب بيانات المكاتب: {(error as Error)?.message}
        </Alert>
      )}

      {serverMessage && !isError && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {serverMessage}
        </Alert>
      )}
      <HStack>
        <Select
          w="260px"
          px={3}
          py={3}
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={0}>كل المدن</option>
          {cities.map((type)=>(
            <option key={type.Id} value={type.Id}>{type.CityName}</option>
          ))}
        </Select>
      </HStack>
      <DataTable
        title="بيانات المكاتب"
        data={rows as unknown as AnyRec[]}
        columns={columns}
        onPageChange={setPage}
        page={page}
        pageSize={limit}
        totalRows={totalRows}
        startIndex={offset + 1}
        headerAction={
          <SharedButton
            leftIcon={<AddIcon />}
            to="/maindashboard/offices/add"
            isLoading={isFetching}
          >
            إضافة مكتب
          </SharedButton>
        }
        renderActions={(row) => (
          <RowActions
            row={row as OfficeRow}
            onDeleted={() => refetch()}
            onEdited={(r) =>
              navigate(`/maindashboard/offices/add?edit=${r.id}`, {
                state: { mode: "edit", row: offciesData.find((o: AnyRec) => Number(o.Id ?? o.id) === r.id) },
              })
            }
          />
        )}
      />
    </Box>
  );
}
