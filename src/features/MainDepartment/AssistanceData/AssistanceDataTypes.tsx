import { useMemo, useState, useCallback } from "react";
import {
  Box, Flex, Spinner, Text, useToast, HStack, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  FormControl, FormLabel, Input
} from "@chakra-ui/react";
import { HiDotsHorizontal } from "react-icons/hi";
import SharedButton from "../../../Components/SharedButton/Button";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";

import { useGetAssistanceData } from "./hooks/useGetAssistanceData";
import { useGetOffices } from "../Offices/hooks/useGetOffices";
import { useOfficeOptions } from "./hooks/useOfficeOptions";
import { useAssistanceActions } from "./hooks/useAssistanceActions";
import { PAGE_SIZE } from "./helpers/constants";
import { useGetSubventionTypes } from "../Subvention/hooks/useGetubventionTypes";
import { uploadAssistanceAttachmentViaHF } from "./hooks/uploadAssistanceAttachment";

type Opt = { id: string | number; name: string };

function AssistanceFiltersInline({
  officeId, setOfficeId, officeOptions,
  subventionTypeId, setSubventionTypeId, subventionOptions = [], isDisabled = false,
}: {
  officeId: string | number; setOfficeId: (v: string | number) => void;
  officeOptions: Opt[]; subventionTypeId: string | number; setSubventionTypeId: (v: string | number) => void;
  subventionOptions?: Opt[]; isDisabled?: boolean;
}) {
  return (
    <HStack spacing={3} mb={4} align="center">
      <Select w="260px" px={3} value={subventionTypeId}
        onChange={(e) => setSubventionTypeId(e.target.value === "0" ? 0 : e.target.value)}
        isDisabled={isDisabled}>
        <option value={0}>كل أنواع الإعانة</option>
        {subventionOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </Select>
      <Select w="260px" px={3} value={officeId}
        onChange={(e) => setOfficeId(e.target.value === "0" ? 0 : e.target.value)}
        isDisabled={isDisabled}>
        <option value={0}>كل المكاتب</option>
        {officeOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </Select>
    </HStack>
  );
}

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
  SubventionTypeName?: string;
  [k: string]: any;
};

function formatLYD(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try { return Number(n).toLocaleString("ar-LY", { maximumFractionDigits: 0 }) + " د.ل"; }
  catch { return `${n} د.ل`; }
}

function getApplicantName(r: AssistanceRow): string {
  const c = [r.ApplicantName, r.UserName, r.GeneralUserName, r.FullName, r.Name, r.AssistanceName];
  for (const v of c) { const s = String(v ?? "").trim(); if (s) return s; }
  return "-";
}

export default function AssistanceDataTypes() {
  const [officeId, setOfficeId] = useState<number | string>(0);
  const [subventionTypeId, setSubventionTypeId] = useState<number | string>(0);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AssistanceRow | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isActing, setIsActing] = useState(false);

  const toast = useToast();

  // Offices
  const { data: officesData, isLoading: officesLoading, isError: officesError } = useGetOffices(0, 200);
  const { officeOptions, officeNameById } = useOfficeOptions(officesData?.rows);

  // Subvention types
  const { data: subventionsData, isLoading: subventionsLoading, isError: subventionsError } = useGetSubventionTypes(0, 200);
  const subventionRows = useMemo(() => {
    const raw =
      (subventionsData as any)?.rows ??
      (subventionsData as any)?.data?.Result?.[0]?.SubventionTypesData ?? [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim().startsWith("[")) {
      try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
  }, [subventionsData]);
  const subventionOptions = useMemo(
    () => (subventionRows as AnyRec[])
      .map((r: AnyRec) => ({
        id: r.Id ?? r.SubventionTypeId ?? r.TypeId ?? r.code ?? r.id ?? null,
        name: r.Name ?? r.SubventionTypeName ?? r.TypeName ?? r.name ?? "",
      }))
      .filter((o) => o.id != null && String(o.name).trim().length > 0),
    [subventionRows]
  );

  // List
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetAssistanceData(officeId, subventionTypeId, offset, PAGE_SIZE);

  const rows = (data?.rows ?? []) as AssistanceRow[];
  const totalRows = Number(data?.decrypted.data.Result[0].AssistancesCount) || 1 ;

  const { approve, reject, isPending } = useAssistanceActions(() => refetch());
  const showInitialSpinner = isLoading || (isFetching && rows.length === 0);

  const openModal = useCallback((row: AssistanceRow) => {
    setSelectedRow(row);
    setPdfFile(null);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedRow(null);
    setPdfFile(null);
    setIsActing(false);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    const isPdf = f && (f.type === "application/pdf" || f.name?.toLowerCase().endsWith(".pdf"));
    if (f && !isPdf) {
      toast({ status: "error", title: "ملف غير مدعوم", description: "PDF فقط مسموح." });
      e.target.value = "";
      return;
    }
    setPdfFile(f);
  };

  const uploadRequired = async (): Promise<string> => {
    if (!pdfFile) throw new Error("يجب رفع ملف PDF قبل تنفيذ الإجراء.");
    // ✅ تستدعي الدالة المُعدَّلة التي تسمح بالمرور
    const id = await uploadAssistanceAttachmentViaHF(pdfFile); 
    return id;
  };

  const onApproveFromModal = async () => {
    if (!selectedRow) return;
    try {
      setIsActing(true);
      const attachmentId = await uploadRequired();
      await approve(selectedRow.Id, attachmentId);
      toast({ status: "success", title: "تمت الموافقة", description: `Attachment#${attachmentId}`, duration: 1500 });
      closeModal();
    } catch (e: any) {
      toast({ 
        status: "error", 
        title: "فشل الموافقة", 
        description: e?.message || "خطأ غير متوقع" 
      });
      setIsActing(false);
    }
  };

  const onRejectFromModal = async () => {
    if (!selectedRow) return;
    try {
      setIsActing(true);
      const attachmentId = await uploadRequired();
      await reject(selectedRow.Id, attachmentId);
      toast({ status: "success", title: "تمّ الرفض", description: `Attachment#${attachmentId}`, duration: 1500 });
      closeModal();
    } catch (e: any) {
      toast({ 
        status: "error", 
        title: "فشل الرفض", 
        description: e?.message || "خطأ غير متوقع" 
      });
      setIsActing(false);
    }
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: "ApplicantName",
        header: "اسم مقدم الطلب",
        width: "20%",
        render: (r: AnyRec) => getApplicantName(r as AssistanceRow),
      },
      {
        key: "Office_Id",
        header: "المكتب",
        width: "16%",
        render: (r: AnyRec) => {
          const rr = r as AssistanceRow;
          return rr.OfficeName ?? officeNameById.get(rr.Office_Id as any) ?? rr.Office_Id ?? "—";
        },
      },
      {
        key: "SubventionTypeName",
        header: "نوع الإعانة",
        width: "18%",
        render: (r: AnyRec) => (r as AssistanceRow).SubventionTypeName ?? "—",
      },
      {
        key: "WantedAmount",
        header: "القيمة",
        width: "14%",
        render: (r: AnyRec) => formatLYD((r as AssistanceRow).WantedAmount ?? null),
      },
      {
        key: "AssistanceName",
        header: "وصف الطلب",
        width: "22%",
        render: (r: AnyRec) =>
          (r as AssistanceRow).AssistanceDesc ?? (r as AssistanceRow).AssistanceName ?? "—",
      },
      {
        key: "__actions",
        header: "الإجراءات",
        width: "10%",
        render: (r: AnyRec) => (
          <SharedButton
            variant="secondary"
            onClick={() => openModal(r as AssistanceRow)}
            leftIcon={<HiDotsHorizontal />}
          >
            إجراء
          </SharedButton>
        ),
      },
    ],
    [officeNameById, openModal]
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

  const filtersDisabled = officesLoading || officesError || subventionsLoading || subventionsError;

  return (
    <Box p={4}>
      <AssistanceFiltersInline
        officeId={officeId}
        setOfficeId={(v) => { setPage(1); setOfficeId(v); }}
        subventionTypeId={subventionTypeId}
        setSubventionTypeId={(v) => { setPage(1); setSubventionTypeId(v); }}
        officeOptions={officeOptions}
        subventionOptions={subventionOptions}
        isDisabled={filtersDisabled}
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
        <Text mt={3} color="gray.500">لا توجد بيانات.</Text>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent rounded="xl" p={2}>
          <ModalHeader fontWeight="700">إجراء على الطلب</ModalHeader>
          <ModalBody>
            <Text mb={4} color="gray.600">
              {selectedRow ? `مقدم/ة الطلب: ${getApplicantName(selectedRow)}` : ""}
            </Text>

            <FormControl isRequired>
              <FormLabel>رفع مرفق (PDF فقط)</FormLabel>
              <Input type="file" accept="application/pdf" onChange={onFileChange} />
              <Text fontSize="sm" color="gray.500" mt={2}>
                المرفق إلزامي — يجب رفع ملف PDF قبل الموافقة أو الرفض.
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <SharedButton variant="dangerOutline" onClick={closeModal}>
              إلغاء
            </SharedButton>
            <SharedButton
              variant="success"
              onClick={onApproveFromModal}
              isLoading={isPending || isActing}
              disabled={!pdfFile || isPending || isActing}
            >
              موافقة
            </SharedButton>
            <SharedButton
              variant="danger"
              onClick={onRejectFromModal}
              isLoading={isPending || isActing}
              disabled={!pdfFile || isPending || isActing}
            >
              رفض
            </SharedButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}