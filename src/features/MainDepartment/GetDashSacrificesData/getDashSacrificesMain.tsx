import React, { useMemo, useState } from "react";
import { Box, Flex, Spinner, Alert, AlertIcon, Text, useToast } from "@chakra-ui/react";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetSacrificesDashData } from "../../OfficeDashboard/SacrificesData/hooks/useGetSacrificeData";
import { useUpdateSacrificesData } from "../../OfficeDashboard/SacrificesData/hooks/useUpdateSacrificesData";
import ActionButtons from "../../../Components/SharedButton/ActionButtons";

const PAGE_SIZE = 10;

/** عرض التاريخ فقط (DD/MM/YYYY) */
function formatApiDate(value: any): string {
  if (!value) return "—";
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    const [y,m,d] = value.slice(0,10).split("-");
    return `${d}/${m}/${y}`;
  }
  const t = Date.parse(value);
  if (!isNaN(t)) {
    const dt = new Date(t);
    const dd = String(dt.getDate()).padStart(2,"0");
    const mm = String(dt.getMonth()+1).padStart(2,"0");
    const yy = dt.getFullYear();
    return `${dd}/${mm}/${yy}`;
  }
  return "—";
}

type Row = {
  Id?: any;
  SacrificeOrderId?: any;
  OrderId?: any;
  SacrificeOrderDate?: any;
  Office_Id?: any;
  OfficeId?: any;
  GeneralUser_Id?: any;
  UserId?: any;
  SacrificeTotalAmount?: any;
  TotalAmount?: any;
  OfficeName?: string;
  ApplicantName?: string;
  UserName?: string;
  IsApproved?: any;
  IsDone?: any;
};

export default function GetSacrificeDataMain() {
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const toast = useToast();
  const { data, isLoading, isError, error, isFetching } =
    useGetSacrificesDashData(0 /* إدارة تشوف الكل */, offset, limit);

  const rows = (data?.rows ?? []) as Row[];
  const totalRows = Number(data?.decrypted.data.Result[0].SacrificesCount) || 1;

  const upd = useUpdateSacrificesData();

  const approveOrReject = async (r: Row, approve: boolean) => {
    const Id = r.Id ?? r.SacrificeOrderId ?? r.OrderId ?? r["id"];
    if (!Id) {
      toast({ status: "warning", title: "لا يمكن تحديد السجل", description: "المعرّف مفقود." });
      return;
    }
    try {
      await upd.mutateAsync({
        Id,
        SacrificeOrderDate: r.SacrificeOrderDate ?? "",
        Office_Id: r.Office_Id ?? r.OfficeId ?? "",
        GeneralUser_Id: r.GeneralUser_Id ?? r.UserId ?? "",
        SacrificeOrderTotalAmount: r.SacrificeTotalAmount ?? r.TotalAmount ?? 0,
        IsApproved: approve,            // ✅ قبول/رفض
        ApprovedDate: new Date(),       // ✅ سيُرسل DD/MM/YYYY
        ApprovedBy: 1,                  // ✅ لو عندك adminId من localStorage بدله هنا
        IsDone: r.IsDone ?? 0,
      });
      toast({ status: "success", title: approve ? "تمت الموافقة" : "تمّ الرفض" });
    } catch (e: any) {
      toast({ status: "error", title: "فشل تنفيذ العملية", description: e?.message || "حاول مرة أخرى" });
    }
  };

  const COLUMNS: Column[] = useMemo(() => [
    {
      key: "ApplicantName",
      header: "اسم مقدم الطلب",
      render: (row: AnyRec) => {
        const r = row as Row;
        return r.UserName ?? r.ApplicantName ?? (r.GeneralUser_Id ? `مستخدم رقم ${r.GeneralUser_Id}` : "—");
      },
    },
    { key: "OfficeName", header: "المكتب", width: "16%", render: (row: AnyRec) => (row as Row).OfficeName ?? "—" },
    { key: "SacrificeOrderDate", header: "تاريخ الطلب", width: "16%", render: (row: AnyRec) => formatApiDate((row as Row).SacrificeOrderDate) },
    {
      key: "SacrificeTotalAmount",
      header: "الإجمالي",
      render: (row: AnyRec) => {
        const r = row as Row;
        const v = r.SacrificeTotalAmount ?? r.TotalAmount ?? 0;
        return <Text fontWeight="600">{String(v)} د.ل</Text>;
      },
    },
    {
      key: "__actions",
      header: "الإجراء",
      render: (row: AnyRec) => (
        <ActionButtons
          onApprove={() => approveOrReject(row as Row, true)}
          onReject={() => approveOrReject(row as Row, false)}
          disabled={upd.isPending || isFetching}
        />
      ),
    },
  ], [upd.isPending, isFetching]);

  if (isLoading || (isFetching && rows.length === 0)) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }
  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب بيانات الأضاحي: {(error as Error)?.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <DataTable
        title="طلبات الأضاحي"
        data={rows as unknown as AnyRec[]}
        columns={COLUMNS}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        totalRows={totalRows}
        onPageChange={setPage}
      />
      {rows.length === 0 && <Text mt={3} color="gray.500">لا توجد بيانات.</Text>}
    </Box>
  );
}
