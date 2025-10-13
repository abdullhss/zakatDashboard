import { useMemo, useState } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetAssistanceData } from "./hooks/useGetAssistanceData";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useOfficeOptions } from "./hooks/useOfficeOptions";
import { useAssistanceActions } from "./hooks/useAssistanceActions";
import AssistanceFilters from "./helpers/AssistanceFilters";
import ActionButtons from "../../../Components/SharedButton/ActionButtons";
import { PAGE_SIZE } from "./helpers/constants";

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

export default function AssistanceDataTypes() {
  const [officeId, setOfficeId] = useState<number | string>(0);
  const [subventionTypeId, setSubventionTypeId] = useState<number | string>(0);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const {
    data: officesData,
    isLoading: officesLoading,
    isError: officesError,
  } = useGetOffices(0, 200);

  const { officeOptions, officeNameById } = useOfficeOptions(officesData?.rows);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAssistanceData(officeId, subventionTypeId, offset, PAGE_SIZE);

  const rows = (data?.rows ?? []) as AssistanceRow[];
  const totalRows = data?.totalRows ?? rows.length;

  const { approve, reject, isPending } = useAssistanceActions(refetch);
  const showInitialSpinner = isLoading || (isFetching && rows.length === 0);

  const onApproveRow = (row: AnyRec) => approve((row as AssistanceRow).Id);
  const onRejectRow = (row: AnyRec) => reject((row as AssistanceRow).Id);

  const columns: Column[] = useMemo(
    () => [
      {
        key: "ApplicantName",
        header: "اسم مقدم الطلب",
        width: "24%",
        render: (r: AnyRec) =>
          (r as AssistanceRow).ApplicantName ??
          (r as AssistanceRow).UserName ??
          "—",
      },
      {
        key: "Office_Id",
        header: "المكتب",
        width: "16%",
        render: (r: AnyRec) => {
          const rr = r as AssistanceRow;
          return (
            rr.OfficeName ??
            officeNameById.get(rr.Office_Id as any) ??
            rr.Office_Id ??
            "—"
          );
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
          (r as AssistanceRow).AssistanceName ??
          "—",
      },
      {
        key: "__actions",
        header: "الإجراء",
        width: "10%",
        render: (r: AnyRec) => (
          <ActionButtons
            onApprove={() => onApproveRow(r)}
            onReject={() => onRejectRow(r)}
            disabled={isFetching || isPending}
          />
        ),
      },
    ],
    [officeNameById, isFetching, isPending]
  );

  if (showInitialSpinner) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (isError) {
    return <Text color="red.500">حدث خطأ: {(error as Error)?.message}</Text>;
  }

  return (
    <Box p={4}>
      <AssistanceFilters
        officeId={officeId}
        setOfficeId={(v) => {
          setPage(1);
          setOfficeId(v);
        }}
        subventionTypeId={subventionTypeId}
        setSubventionTypeId={(v) => {
          setPage(1);
          setSubventionTypeId(v);
        }}
        officeOptions={officeOptions}
        isDisabled={officesLoading || officesError}
      />

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

{isFetching && (
  <Flex mt={3} align="center" gap={2}>
    <Spinner size="sm" />
    <Text fontSize="sm" color="gray.600">جارِ تحديث البيانات…</Text>
  </Flex>
)}

      {rows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">
          لا توجد بيانات.
        </Text>
      )}
    </Box>
  );
}
