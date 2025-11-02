import { useMemo, useState, useCallback, useRef } from "react";
import { Box, Flex, Spinner, Alert, AlertIcon, Text, useToast } from "@chakra-ui/react";
import DataTable from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetCampaignQuery } from "../../MainDepartment/GetCashCampaign/hooks/useGetCampaignData";
import useUpdateCampaignData from "../../MainDepartment/GetCashCampaign/hooks/useUpdateCampaignData";
import { getSession, isOffice } from "../../../session";

import type { CampaignRow } from "../../MainDepartment/GetCashCampaign/utils/types";
import { filterRowsByOffice, hasOfficeColumn } from "../../MainDepartment/GetCashCampaign/utils/sessionFilters";
import { createCampaignColumns } from "../../MainDepartment/GetCashCampaign/components/createCampaignColumns";

const PAGE_SIZE = 10;
const APPROVAL_DATE: string | Date = new Date();

// عدّلهم على قد نظامك
const POINT_ID = 0;
const DATA_TOKEN = "Zakat";

export default function Campaigns() {
  const toast = useToast();
  const { officeId } = getSession();

  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetCampaignQuery(offset, PAGE_SIZE);

  // 🛑 استخراج وتحليل البيانات (المنطق الذي تم تعديله في الـ Hook)
  const serverRows = (data?.rows ?? []) as CampaignRow[];
  const serverTotalRows = data?.totalRows ?? serverRows.length;

  // فلترة تلقائية حسب الدور O
  const filteredRows: CampaignRow[] = useMemo(
    () => filterRowsByOffice(serverRows, officeId),
    [serverRows, officeId]
  );

  // ترقيم الصفحات:
  const visibleRows: CampaignRow[] = useMemo(() => {
    if (!isOffice()) return serverRows;
    const start = offset;
    const end = start + PAGE_SIZE;
    return filteredRows.slice(start, end);
  }, [serverRows, filteredRows, offset]);

  const totalRowsForTable = useMemo(() => {
    return isOffice() ? filteredRows.length : serverTotalRows;
  }, [filteredRows.length, serverTotalRows]);

  const updateTx = useUpdateCampaignData();
  const busyRowId = useRef<CampaignRow["Id"] | null>(null);

  const finalize = () => { busyRowId.current = null; };

  const onApprove = useCallback(async (row: AnyRec) => {
    try {
      const cast = row as CampaignRow;
      busyRowId.current = cast.Id;
      const summary = await updateTx.mutateAsync({
        id: cast.Id,
        isApproved: true,
        approvedDate: APPROVAL_DATE,
        pointId: POINT_ID,
        dataToken: DATA_TOKEN,
      });
      toast({ title: summary?.message || "تمت الموافقة على الحملة", status: "success", duration: 1500 });
      await refetch();
    } catch (e: any) {
      toast({ title: "فشل الموافقة", description: e?.message ?? "Unknown error", status: "error" });
    } finally {
      finalize();
    }
  }, [updateTx, refetch, toast]);

  const onReject = useCallback(async (row: AnyRec) => {
    try {
      const cast = row as CampaignRow;
      busyRowId.current = cast.Id;
      const summary = await updateTx.mutateAsync({
        id: cast.Id,
        isApproved: false,
        approvedDate: APPROVAL_DATE,
        pointId: POINT_ID,
        dataToken: DATA_TOKEN,
      });
      toast({ title: summary?.message || "تم رفض الحملة", status: "warning", duration: 1500 });
      await refetch();
    } catch (e: any) {
      toast({ title: "فشل الرفض", description: e?.message ?? "Unknown error", status: "error" });
    } finally {
      finalize();
    }
  }, [updateTx, refetch, toast]);

  const hasOfficeInfo = useMemo(() => hasOfficeColumn(serverRows), [serverRows]);

  const columns: Column[] = useMemo(
    () => createCampaignColumns({
      hasOfficeInfo,
      updatePending: updateTx.isPending,
      busyRowId,
      onApprove,
      onReject,
    }),
    [hasOfficeInfo, updateTx.isPending, onApprove, onReject]
  );

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء تحميل البيانات: {(error as Error)?.message}
      </Alert>
    );
  }

  if (isLoading && !isFetching) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }

  return (
    <Box>
      <DataTable
        title={`قائمة الحملات${isOffice() ? " - مكتبك فقط" : ""}`}
        data={visibleRows as unknown as AnyRec[]}
        columns={columns}
        totalRows={totalRowsForTable}
        stickyHeader
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        startIndex={offset + 1}
      />

      {visibleRows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">لا توجد بيانات.</Text>
      )}
    </Box>
  );
}