import { useMemo, useState, useCallback } from "react";
import {
  Box, Flex, Spinner, Alert, AlertIcon, HStack, Text, useToast
} from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";

import DataTable from "../../../Components/Table/DataTable"; // default import
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetCampaignQuery } from "./hooks/useGetCampaignData";
import useUpdateCampaignData from "./hooks/useUpdateCampaignData"; // هوك التحديث

type CampaignRow = {
  Id: number | string;
  CampaignName: string;
  CampaignType?: string;
  CampaignDesc?: string;
  WantedAmount?: number;
  CampaignRemainingAmount?: number;
  UserName?: string;
  CreatedDate?: string;
  IsActive?: boolean;
  GeneralUser_Id?: number | string;
};

const PAGE_SIZE = 10;
// استخدم تاريخ النهارده أو ثبّت تاريخ معين "20/09/2025"
const APPROVAL_DATE: string | Date = new Date();

/** أزرار الإجراءات */
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
    width: 45,
    height: 45,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 11,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
  const inner: React.CSSProperties = {
    width: 23,
    height: 23,
    borderRadius: 6,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

export default function Campaigns() {
  const toast = useToast();

  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetCampaignQuery(offset, PAGE_SIZE);

  const rows = (data?.rows ?? []) as CampaignRow[];
  const totalRows = data?.totalRows ?? rows.length;

  const updateTx = useUpdateCampaignData();

  // عدّلهم على قد نظامك
  const POINT_ID = 0;
  const DATA_TOKEN = "Zakat";

  const onApprove = useCallback(async (row: AnyRec) => {
    try {
      await updateTx.mutateAsync({
        id: (row as CampaignRow).Id,
        isApproved: true,
        approvedDate: APPROVAL_DATE, // أو "20/09/2025"
        pointId: POINT_ID,
        dataToken: DATA_TOKEN,
      });
      toast({ title: "تمت الموافقة على الحملة", status: "success", duration: 1200 });
      refetch();
    } catch (e: any) {
      toast({ title: "فشل الموافقة", description: e?.message ?? "Unknown error", status: "error" });
    }
  }, [updateTx, refetch, toast]);

  const onReject = useCallback(async (row: AnyRec) => {
    try {
      await updateTx.mutateAsync({
        id: (row as CampaignRow).Id,
        isApproved: false,
        approvedDate: APPROVAL_DATE, // نرسل تاريخ عند الرفض برضه
        pointId: POINT_ID,
        dataToken: DATA_TOKEN,
      });
      toast({ title: "تم رفض الحملة", status: "warning", duration: 1200 });
      refetch();
    } catch (e: any) {
      toast({ title: "فشل الرفض", description: e?.message ?? "Unknown error", status: "error" });
    }
  }, [updateTx, refetch, toast]);

  const columns = useMemo<Column[]>(() => [
    {
      key: "CampaignName",
      header: "اسم الحملة",
      width: "24%",
      render: (r: AnyRec) => (
        <Text fontWeight="600" color="gray.700">
          {(r as CampaignRow).CampaignName ?? "—"}
        </Text>
      ),
    },
    {
      key: "CampaignType",
      header: "نوع الحملة",
      width: "14%",
      render: (r: AnyRec) => (r as CampaignRow).CampaignType ?? "—",
    },
    {
      key: "WantedAmount",
      header: "المبلغ المستهدف",
      width: "14%",
      render: (r: AnyRec) => (r as CampaignRow).WantedAmount ?? "—",
    },
    {
      key: "CampaignRemainingAmount",
      header: "المبلغ المتبقي",
      width: "14%",
      render: (r: AnyRec) => (r as CampaignRow).CampaignRemainingAmount ?? "—",
    },
    {
      key: "UserName",
      header: "اسم المستخدم",
      width: "14%",
      render: (r: AnyRec) => (r as CampaignRow).UserName ?? "—",
    },
    {
      key: "CreatedDate",
      header: "تاريخ الإنشاء",
      width: "14%",
      render: (r: AnyRec) => {
        const d = (r as CampaignRow).CreatedDate;
        return d ? new Date(d).toLocaleDateString("ar-EG") : "—";
      },
    },
    {
      key: "__actions",
      header: "الإجراء",
      width: "12%",
      render: (r: AnyRec) => (
        <ActionButtons
          row={r}
          onApprove={onApprove}
          onReject={onReject}
          disabled={updateTx.isPending}
        />
      ),
    },
  ], [onApprove, onReject, updateTx.isPending]);

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء تحميل البيانات: {(error as Error)?.message}
      </Alert>
    );
  }

  // السبينر برا الجدول (زي صفحة المدن)
  if (isLoading && !isFetching) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }

  return (
    <Box>
      <DataTable
        title="قائمة الحملات"
        data={rows as unknown as AnyRec[]}
        columns={columns}
        totalRows={totalRows}
        stickyHeader
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        startIndex={offset + 1}
      />

      {rows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">لا توجد بيانات.</Text>
      )}
    </Box>
  );
}
