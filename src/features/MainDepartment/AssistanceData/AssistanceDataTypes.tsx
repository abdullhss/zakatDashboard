import { useMemo, useState } from "react";
import { Box, Flex, Spinner, Text, useToast, HStack, Select } from "@chakra-ui/react";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetAssistanceData } from "./hooks/useGetAssistanceData";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useOfficeOptions } from "./hooks/useOfficeOptions";
import { useAssistanceActions } from "./hooks/useAssistanceActions";
// import AssistanceFilters from "./helpers/AssistanceFilters";
import ActionButtons from "../../../Components/SharedButton/ActionButtons";
import { PAGE_SIZE } from "./helpers/constants";
import { useGetSubventionTypes } from "../Subvention/hooks/useGetubventionTypes";

/* ================= Inline AssistanceFilters (مؤقتًا في نفس الملف) ================= */
type Opt = { id: string | number; name: string };
function AssistanceFiltersInline({
  officeId,
  setOfficeId,
  officeOptions,
  subventionTypeId,
  setSubventionTypeId,
  subventionOptions = [],
  isDisabled = false,
}: {
  officeId: string | number;
  setOfficeId: (v: string | number) => void;
  officeOptions: Opt[];
  subventionTypeId: string | number;
  setSubventionTypeId: (v: string | number) => void;
  subventionOptions?: Opt[];
  isDisabled?: boolean;
}) {
  return (
    <HStack spacing={3} mb={4} align="center">
      <Select
        w="260px"
        value={subventionTypeId}
        onChange={(e) => setSubventionTypeId(e.target.value === "0" ? 0 : e.target.value)}
        isDisabled={isDisabled}
      >
        <option value={0}>كل أنواع الإعانة</option>
        {subventionOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </Select>

      <Select
        w="260px"
        value={officeId}
        onChange={(e) => setOfficeId(e.target.value === "0" ? 0 : e.target.value)}
        isDisabled={isDisabled}
      >
        <option value={0}>كل المكاتب</option>
        {officeOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </Select>
    </HStack>
  );
}
/* ================================================================================ */

type AssistanceRow = {
  Id: number | string;
  AssistanceName?: string;
  AssistanceDesc?: string;
  WantedAmount?: number;
  Office_Id?: number | string;
  OfficeName?: string;
  ApplicantName?: string;
  UserName?: string;
  GeneralUserName?: string;
  FullName?: string;
  Name?: string;
  [k: string]: any;
};

function formatLYD(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try {
    return Number(n).toLocaleString("ar-LY", { maximumFractionDigits: 0 }) + " د.ل";
  } catch {
    return `${n} د.ل`;
  }
}

function getApplicantName(r: AssistanceRow): string {
  const candidates = [
    r.ApplicantName,
    r.UserName,
    r.GeneralUserName,
    r.FullName,
    r.Name,
    r.AssistanceName,
  ];
  for (const v of candidates) {
    const s = String(v ?? "").trim();
    if (s.length) return s;
  }
  return "-";
}

export default function AssistanceDataTypes() {
  const [officeId, setOfficeId] = useState<number | string>(0);
  const [subventionTypeId, setSubventionTypeId] = useState<number | string>(0);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const toast = useToast();

  const {
    data: officesData,
    isLoading: officesLoading,
    isError: officesError,
  } = useGetOffices(0, 200);
  const { officeOptions, officeNameById } = useOfficeOptions(officesData?.rows);

  const {
    data: subventionsData,
    isLoading: subventionsLoading,
    isError: subventionsError,
  } = useGetSubventionTypes(0, 200);

  const subventionRows = useMemo(() => {
    const raw =
      (subventionsData as any)?.rows ??
      (subventionsData as any)?.data?.Result?.[0]?.SubventionTypesData ??
      [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim().startsWith("[")) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }, [subventionsData]);

  const subventionOptions = useMemo(
    () =>
      (subventionRows as AnyRec[])
        .map((r: AnyRec) => ({
          id: r.Id ?? r.SubventionTypeId ?? r.TypeId ?? r.code ?? r.id ?? null,
          name: r.Name ?? r.SubventionTypeName ?? r.TypeName ?? r.name ?? "",
        }))
        .filter((o) => o.id != null && String(o.name).trim().length > 0),
    [subventionRows]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAssistanceData(officeId, subventionTypeId, offset, PAGE_SIZE);

  const rows = (data?.rows ?? []) as AssistanceRow[];
  const totalRows = data?.totalRows ?? rows.length; // 👈 كانت the totalRows

  const { approve, reject, isPending } = useAssistanceActions(refetch);
  const showInitialSpinner = isLoading || (isFetching && rows.length === 0);

  const onApproveRow = async (row: AnyRec) => {
    try {
      await approve((row as AssistanceRow).Id);
      toast({ status: "success", title: "تمت الموافقة", duration: 1500 });
    } catch (e: any) {
      toast({
        status: "error",
        title: "فشل تنفيذ العملية",
        description: e?.message || "حدث خطأ أثناء الموافقة",
      });
    }
  };

  const onRejectRow = async (row: AnyRec) => {
    try {
      await reject((row as AssistanceRow).Id);
      toast({ status: "success", title: "تمّ الرفض", duration: 1500 });
    } catch (e: any) {
      toast({
        status: "error",
        title: "فشل تنفيذ العملية",
        description: e?.message || "حدث خطأ أثناء الرفض",
      });
    }
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: "ApplicantName",
        header: "اسم مقدم الطلب",
        width: "24%",
        render: (r: AnyRec) => getApplicantName(r as AssistanceRow),
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
          return formatLYD(v ?? null);
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
      <AssistanceFiltersInline
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
        subventionOptions={subventionOptions}
        isDisabled={officesLoading || officesError || subventionsLoading || subventionsError}
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
          <Text fontSize="sm" color="gray.600">
            جارِ تحديث البيانات…
          </Text>
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
