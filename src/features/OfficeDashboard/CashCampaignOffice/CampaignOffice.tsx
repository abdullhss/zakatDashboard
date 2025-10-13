import { useMemo, useState, useCallback } from "react";
import {
  Box, Flex, Spinner, Alert, AlertIcon, HStack, Text, useToast
} from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";

import DataTable from "../../../Components/Table/DataTable"; 
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetCampaignQuery } from "../../MainDepartment/GetCashCampaign/hooks/useGetCampaignData";
import useUpdateCampaignData from "../../MainDepartment/GetCashCampaign/hooks/useUpdateCampaignData";
import { getSession, isOffice } from "../../../session"; 

type CampaignRow = {
  Id: number | string;
  CampaignName: string;
  CampaignType?: string;
  CampaignDesc?: string;
  WantedAmount?: number;
  CampaignRemainingAmount?: number;
  UserName?: string;
  CreatedDate?: string | Date;
  IsActive?: boolean;
  GeneralUser_Id?: number | string;
  Office_Id?: number | string;
  OfficeName?: string;
};

const PAGE_SIZE = 10;
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
  const { officeId, role } = getSession();

  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  // جلب بيانات الصفحة من السيرفر (يستمر كما هو)
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetCampaignQuery(offset, PAGE_SIZE);

  const serverRows = (data?.rows ?? []) as CampaignRow[];
  const serverTotalRows = data?.totalRows ?? serverRows.length;

  // فلترة تلقائية حسب الدور O
  const filteredRows: CampaignRow[] = useMemo(() => {
    if (!isOffice()) return serverRows;
    const myOfficeId = Number(officeId || 0);
    return serverRows.filter((r) => {
      const rowOfficeId = Number(r?.Office_Id ?? 0);
      return rowOfficeId === myOfficeId;
    });
  }, [serverRows, officeId]);

  // ترقيم الصفحات:
  // - Main (M): استخدم ترقيم السيرفر كما هو.
  // - Office (O): قسّم محليًا بعد الفلترة عشان الأعداد تبقى صحيحة بصريًا.
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
        approvedDate: APPROVAL_DATE,
        pointId: POINT_ID,
        dataToken: DATA_TOKEN,
      });
      toast({ title: "تم رفض الحملة", status: "warning", duration: 1200 });
      refetch();
    } catch (e: any) {
      toast({ title: "فشل الرفض", description: e?.message ?? "Unknown error", status: "error" });
    }
  }, [updateTx, refetch, toast]);

  const hasOfficeInfo = useMemo(() => {
    const sample = serverRows[0] || {};
    return ("OfficeName" in sample) || ("Office_Id" in sample);
  }, [serverRows]);

  const columns = useMemo<Column[]>(() => {
    const baseCols: Column[] = [
      {
        key: "CampaignName",
        header: "اسم الحملة",
        width: "22%",
        render: (r: AnyRec) => (
          <Text fontWeight="600" color="gray.700">
            {(r as CampaignRow).CampaignName ?? "—"}
          </Text>
        ),
      },
      {
        key: "CampaignType",
        header: "نوع الحملة",
        width: "12%",
        render: (r: AnyRec) => (r as CampaignRow).CampaignType ?? "—",
      },
      {
        key: "WantedAmount",
        header: "المبلغ المستهدف",
        width: "12%",
        render: (r: AnyRec) => (r as CampaignRow).WantedAmount ?? "—",
      },
      {
        key: "CampaignRemainingAmount",
        header: "المبلغ المتبقي",
        width: "12%",
        render: (r: AnyRec) => (r as CampaignRow).CampaignRemainingAmount ?? "—",
      },
      {
        key: "UserName",
        header: "اسم المستخدم",
        width: "12%",
        render: (r: AnyRec) => (r as CampaignRow).UserName ?? "—",
      },
      {
        key: "CreatedDate",
        header: "تاريخ الإنشاء",
        width: "12%",
        render: (r: AnyRec) => {
          const d = (r as CampaignRow).CreatedDate;
          const dateVal = typeof d === "string" || d instanceof Date ? new Date(d) : null;
          return d && dateVal ? dateVal.toLocaleDateString("ar-EG") : "—";
        },
      },
    ];

    // لو الدور Main وعندنا بيانات مكتب، أضف عمود المكتب
    const officeCol: Column[] =
      (!isOffice() && hasOfficeInfo)
        ? [{
            key: "Office",
            header: "المكتب",
            width: "12%",
            render: (r: AnyRec) => {
              const rr = r as CampaignRow;
              return rr.OfficeName ?? rr.Office_Id ?? "—";
            },
          }]
        : [];

    const actionsCol: Column = {
      key: "__actions",
      header: "الإجراء",
      width: "10%",
      render: (r: AnyRec) => (
        <ActionButtons
          row={r}
          onApprove={onApprove}
          onReject={onReject}
          disabled={updateTx.isPending}
        />
      ),
    };

    return [...baseCols.slice(0, 1), ...officeCol, ...baseCols.slice(1), actionsCol];
  }, [hasOfficeInfo, onApprove, onReject, updateTx.isPending]);

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
