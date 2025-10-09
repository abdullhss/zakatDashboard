// src/features/Assistances/AssistanceDataTypes.tsx
import { useCallback, useMemo, useState } from "react";
import {
  Box, Flex, Spinner, Text, HStack, Select, useToast,
} from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";

import { useGetAssistanceData } from "./hooks/useGetAssistanceData";
import useUpdateAssistanceData from "./hooks/useUpdateAssistanceData";
import { useGetOffices } from "../Offices/hooks/useGetOffices";

type AssistanceRow = {
  Id: number | string;
  AssistanceName?: string;
  AssistanceDesc?: string;
  WantedAmount?: number;
  Office_Id?: number | string;
  OfficeName?: string;
  ApplicantName?: string;
  UserName?: string;
  [k: string]: any;
};

const PAGE_SIZE = 10;
const DATA_TOKEN = "Zakat";
const POINT_ID = 0;

function ActionButtons({
  row,
  onApprove,
  onReject,
  disabled,
}: {
  row: AnyRec;
  onApprove: (row: AnyRec) => void;
  onReject: (row: AnyRec) => void;
  disabled?: boolean;
}) {
  const green = "#237000";
  const red = "#FF0000";
  const base: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 10, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 8,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
  };
  const inner: React.CSSProperties = {
    width: 20, height: 20, borderRadius: 6, background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  return (
    <HStack spacing="10px">
      <Box
        style={{ ...base, background: green }}
        onClick={(e) => { if (!disabled) { e.stopPropagation(); onApprove(row); } }}
        title="موافقة"
      >
        <Box style={inner}><FaCheck color={green} /></Box>
      </Box>
      <Box
        style={{ ...base, background: red }}
        onClick={(e) => { if (!disabled) { e.stopPropagation(); onReject(row); } }}
        title="رفض"
      >
        <Box style={inner}><FaTimes color={red} /></Box>
      </Box>
    </HStack>
  );
}

export default function AssistanceDataTypes() {
  const toast = useToast();

  const [officeId, setOfficeId] = useState<number | string>(0);
  const [subventionTypeId, setSubventionTypeId] = useState<number | string>(0);

  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const {
    data: officesData,
    isLoading: officesLoading,
    isError: officesError,
  } = useGetOffices(0, 200);

  const { officeOptions, officeNameById } = useMemo(() => {
    const rows = officesData?.rows ?? [];
    const opts = [
      { id: 0, name: "كل المكاتب" },
      ...rows.map((r: AnyRec) => ({
        id: r.id ?? r.Id,
        name: r.companyName ?? r.OfficeName ?? `مكتب #${r.id ?? r.Id}`,
      })),
    ];
    const map = new Map<string | number, string>();
    opts.forEach(o => map.set(o.id, o.name));
    return { officeOptions: opts, officeNameById: map };
  }, [officesData]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetAssistanceData(officeId, subventionTypeId, offset, PAGE_SIZE);

  const rows = (data?.rows ?? []) as AssistanceRow[];
  const totalRows = data?.totalRows ?? rows.length;

  const updateTx = useUpdateAssistanceData();

  const onApprove = useCallback(async (row: AnyRec) => {
    await updateTx.mutateAsync({
      id: (row as AssistanceRow).Id,
      isApproved: true,
      approvedDate: new Date(), // هيتحول dd/MM/yyyy
      dataToken: DATA_TOKEN,
      pointId: POINT_ID,
    });
    toast({ title: "تمت الموافقة على الطلب", status: "success", duration: 1200 });
    refetch();
  }, [updateTx, toast, refetch]);

  const onReject = useCallback(async (row: AnyRec) => {
    await updateTx.mutateAsync({
      id: (row as AssistanceRow).Id,
      isApproved: false,
      approvedDate: new Date(), // ← هنا بعتنا تاريخ برضه للرفض
      dataToken: DATA_TOKEN,
      pointId: POINT_ID,
    });
    toast({ title: "تم رفض الطلب", status: "warning", duration: 1200 });
    refetch();
  }, [updateTx, toast, refetch]);

  const columns: Column[] = useMemo(
    () => [
      {
        key: "ApplicantName",
        header: "اسم مقدم الطلب",
        width: "24%",
        render: (r: AnyRec) =>
          (r as AssistanceRow).ApplicantName ??
          (r as AssistanceRow).UserName ?? "—",
      },
      {
        key: "Office_Id",
        header: "المكتب",
        width: "16%",
        render: (r: AnyRec) => {
          const rr = r as AssistanceRow;
          return rr.OfficeName ??
                 officeNameById.get(rr.Office_Id as any) ??
                 rr.Office_Id ?? "—";
        },
      },
      {
        key: "WantedAmount",
        header: "القيمة",
        width: "16%",
        render: (r: AnyRec) => {
          const v = (r as AssistanceRow).WantedAmount;
          return v != null ? Number(v).toLocaleString("ar-EG") : "—";
        },
      },
      {
        key: "AssistanceName",
        header: "وصف الطلب",
        width: "26%",
        render: (r: AnyRec) =>
          (r as AssistanceRow).AssistanceDesc ??
          (r as AssistanceRow).AssistanceName ?? "—",
      },
      {
        key: "__actions",
        header: "الإجراء",
        width: "10%",
        render: (r: AnyRec) => (
          <ActionButtons
            row={r}
            onApprove={onApprove}
            onReject={onReject}
            disabled={isFetching || updateTx.isPending}
          />
        ),
      },
    ],
    [onApprove, onReject, isFetching, updateTx.isPending, officeNameById]
  );

  if (isLoading && !isFetching) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }
  if (isError) {
    return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;
  }

  return (
    <Box p={4}>
      <HStack mb={4} spacing={3}>
        <Select
          value={String(officeId)}
          onChange={(e) => { setPage(1); setOfficeId(e.target.value); }}
          maxW="260px"
          variant="filled"
          isDisabled={officesLoading || officesError}
        >
          {officeOptions.map(o => (
            <option key={String(o.id)} value={String(o.id)}>{o.name}</option>
          ))}
        </Select>

        <Select
          value={String(subventionTypeId)}
          onChange={(e) => { setPage(1); setSubventionTypeId(e.target.value); }}
          maxW="220px"
          variant="filled"
        >
          <option value="0">كل أنواع الإعانة</option>
          <option value="1">إعانة المدارس</option>
          <option value="2">إعانة علاج</option>
          <option value="3">إعانة أخرى</option>
        </Select>
      </HStack>

      <DataTable
        title="طلبات الإعانة"
        data={rows as unknown as AnyRec[]}
        columns={columns}
        startIndex={offset + 1}
        page={page}
        pageSize={PAGE_SIZE}
        totalRows={totalRows}
        onPageChange={setPage}
      />

      {rows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">لا توجد بيانات.</Text>
      )}
    </Box>
  );
}
