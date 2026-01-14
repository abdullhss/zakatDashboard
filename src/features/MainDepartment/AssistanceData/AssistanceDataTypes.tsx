import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Box, Flex, Spinner, Text, useToast, HStack, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  FormControl, FormLabel, Input, VStack, Badge, Divider, Card, CardBody
} from "@chakra-ui/react";
import { HiDotsHorizontal, HiUserAdd } from "react-icons/hi";
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
import { doTransaction, executeProcedure } from "../../../api/apiClient";
import { useImagesPathContext } from "../../../Context/ImagesPathContext";

type Opt = { id: string | number; name: string };

function AssistanceFiltersInline({
  officeId, setOfficeId, officeOptions,
  subventionTypeId, setSubventionTypeId, status, setStatus, subventionOptions = [], isDisabled = false,
}: {
  officeId: string | number; setOfficeId: (v: string | number) => void;
  officeOptions: Opt[]; subventionTypeId: string | number; setSubventionTypeId: (v: string | number) => void;
  status: number | string;
  setStatus: any;
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
        {officeOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </Select>
      <Select
        w="260px"
        px={3}
        value={status}
        onChange={(e) => setStatus(Number(e.target.value))}
        isDisabled={isDisabled}
      >
        <option value={0}>كل الحالات</option>
        <option value={1}>مقبول</option>
        <option value={2}>مرفوض</option>
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
  MobileNum?: string;
  PersonsCount?: number;
  CreatedDate?: string;
  IsApproved?: boolean;
  IsActive?: boolean;
  Researcher_Id?: number;
  ResearcherName?: string;
  ResreachFileName?: string;
  Status?: string;
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

function AssistanceDetailsModal({
  isOpen,
  onClose,
  row,
  onAssignResearcher,
  onApprove,
  onReject,
  isPending,
  isActing,
  pdfFile,
  onFileChange,
  allResearcher,
  refetch
}: {
  isOpen: boolean;
  onClose: () => void;
  row: AssistanceRow | null;
  onAssignResearcher: (updatedRow: AssistanceRow) => void;
  onApprove: (rowId: string | number, attachmentId: string) => Promise<void>;
  onReject: (rowId: string | number, attachmentId: string) => Promise<void>;
  isPending: boolean;
  isActing: boolean;
  pdfFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allResearcher: any[];
  refetch: () => void;
}) {
  const [selectedResearcher, setSelectedResearcher] = useState<string | number>("");
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [localRow, setLocalRow] = useState<AssistanceRow | null>(row);
  const [localPdfFile, setLocalPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLocalRow(row);
    setLocalPdfFile(null);
  }, [row]);

  const handleAssignResearcher = async () => {
    if (!localRow || !selectedResearcher) return;
    try {
      const response = await doTransaction({
        TableName: "g+a67fXnSBQre/3SDxT2uA==",
        WantedAction: 1,
        ColumnsNames: "Id#Researcher_Id",
        ColumnsValues: `${localRow.Id}#${selectedResearcher}`
      });
      
      // العثور على اسم الباحث من القائمة
      const researcher = allResearcher.find(r => r.Id == selectedResearcher);
      const updatedRow = { 
        ...localRow, 
        Researcher_Id: Number(selectedResearcher), 
        ResearcherName: researcher?.FullName 
      };
      
      setLocalRow(updatedRow);
      onAssignResearcher(updatedRow);
      setAssignModalOpen(false);
      
      toast({
        status: "success",
        title: "تم إسناد الباحث",
        duration: 1500,
      });
    } catch (error) {
      console.error("Error assigning researcher:", error);
      toast({
        status: "error",
        title: "خطأ",
        description: "فشل في إسناد الباحث",
        duration: 3000,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    const isPdf = f && (f.type === "application/pdf" || f.name?.toLowerCase().endsWith(".pdf"));
    if (f && !isPdf) {
      toast({ status: "error", title: "ملف غير مدعوم", description: "PDF فقط مسموح." });
      e.target.value = "";
      return;
    }
    setLocalPdfFile(f);
    onFileChange(e);
  };

  const handleApprove = async () => {
    if (!localRow || !localPdfFile) return;
    try {
      setIsUploading(true);
      const attachmentId = await uploadAssistanceAttachmentViaHF(localPdfFile);
      await onApprove(localRow.Id, attachmentId);
      toast({ status: "success", title: "تمت الموافقة", description: `Attachment#${attachmentId}`, duration: 1500 });
      refetch();
      onClose();
    } catch (e: any) {
      toast({ 
        status: "error", 
        title: "فشل الموافقة", 
        description: e?.message || "خطأ غير متوقع" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = async () => {
    if (!localRow || !localPdfFile) return;
    try {
      setIsUploading(true);
      const attachmentId = await uploadAssistanceAttachmentViaHF(localPdfFile);
      await onReject(localRow.Id, attachmentId);
      toast({ status: "success", title: "تمّ الرفض", description: `Attachment#${attachmentId}`, duration: 1500 });
      refetch();
      onClose();
    } catch (e: any) {
      toast({ 
        status: "error", 
        title: "فشل الرفض", 
        description: e?.message || "خطأ غير متوقع" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent rounded="xl" p={4}>
          <ModalHeader fontWeight="700">تفاصيل طلب الإعانة</ModalHeader>
          <ModalBody>
            {localRow ? (
              <VStack spacing={4} align="stretch">
                {/* معلومات الطلب الأساسية */}
                <Card>
                  <CardBody>
                    <Text fontSize="lg" fontWeight="bold" mb={3}>المعلومات الأساسية</Text>
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between">
                        <Text fontWeight="600">اسم مقدم الطلب:</Text>
                        <Text>{getApplicantName(localRow)}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">رقم الهاتف:</Text>
                        <Text>{localRow.MobileNum || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">عدد الأفراد:</Text>
                        <Text>{localRow.PersonsCount || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">المكتب:</Text>
                        <Text>{localRow.OfficeName || "—"}</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                {/* معلومات الإعانة */}
                <Card>
                  <CardBody>
                    <Text fontSize="lg" fontWeight="bold" mb={3}>معلومات الإعانة</Text>
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between">
                        <Text fontWeight="600">نوع الإعانة:</Text>
                        <Text>{localRow.SubventionTypeName || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">المبلغ المطلوب:</Text>
                        <Text>{formatLYD(localRow.WantedAmount)}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">وصف الطلب:</Text>
                        <Text>{localRow.AssistanceDesc || localRow.AssistanceName || "—"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">تاريخ الطلب:</Text>
                        <Text>{new Date(localRow.CreatedDate || "").toLocaleDateString('ar-LY')}</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                {/* حالة الطلب والباحث */}
                <Card>
                  <CardBody>
                    <Text fontSize="lg" fontWeight="bold" mb={3}>الحالة والإسناد</Text>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="600">الباحث المسند:</Text>
                        {localRow.Researcher_Id && localRow.Researcher_Id > 0 ? (
                          <Badge colorScheme="green" p={2} borderRadius="md">
                            {localRow.ResearcherName || "باحث مسند"}
                          </Badge>
                        ) : localStorage.getItem("role") === "O" ? (
                          <SharedButton
                            variant="outline"
                            size="sm"
                            leftIcon={<HiUserAdd />}
                            onClick={() => setAssignModalOpen(true)}
                          >
                            إسناد باحث
                          </SharedButton>
                        ) : (
                          <Badge colorScheme="gray" p={2} borderRadius="md">
                            غير مسند
                          </Badge>
                        )}
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="600">حالة الطلب:</Text>
                        <Badge
                          colorScheme={localRow.Status === "مقبول" ? "green" : localRow.Status === "مرفوض" ? "red" : "yellow"}
                          p={2}
                          borderRadius="md"
                        >
                          {localRow.Status || "معلق"}
                        </Badge>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                {/* قسم الإجراءات (للمدير فقط) - يظهر فقط إذا كان هناك باحث مسند */}
                {localRow.Researcher_Id && localRow.Researcher_Id > 0 && (
                  <>
                    <Divider />
                    <Card>
                      <CardBody>
                        <Text fontSize="lg" fontWeight="bold" mb={3}>الإجراءات</Text>
                        <VStack spacing={4}>
                          <FormControl isRequired>
                            <FormLabel>رفع مرفق البحث (PDF فقط)</FormLabel>
                            <Input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileChange}
                            />
                            <Text fontSize="sm" color="gray.500" mt={2}>
                              {localPdfFile 
                                ? `تم اختيار ملف: ${localPdfFile.name}` 
                                : "يجب رفع ملف PDF قبل تنفيذ الإجراء"}
                            </Text>
                          </FormControl>

                          <Flex gap={3} justify="flex-end" width="100%">
                            <SharedButton
                              variant="success"
                              onClick={handleApprove}
                              isLoading={isPending || isActing || isUploading}
                              disabled={!localPdfFile || isPending || isActing || isUploading}
                              width="120px"
                            >
                              موافقة
                            </SharedButton>
                            <SharedButton
                              variant="danger"
                              onClick={handleReject}
                              isLoading={isPending || isActing || isUploading}
                              disabled={!localPdfFile || isPending || isActing || isUploading}
                              width="120px"
                            >
                              رفض
                            </SharedButton>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  </>
                )}
              </VStack>
            ) : (
              <Text>لا توجد بيانات للعرض</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <SharedButton variant="secondary" onClick={onClose}>
              إغلاق
            </SharedButton>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* مودال إسناد الباحث */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent rounded="xl" p={2}>
          <ModalHeader fontWeight="700">إسناد باحث</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>اختر الباحث</FormLabel>
              <Select
                px={3}
                placeholder="اختر الباحث"
                value={selectedResearcher}
                onChange={(e) => setSelectedResearcher(e.target.value)}
              >
                {allResearcher.map((e) => (
                  <option key={e.Id} value={e.Id}>
                    {e.FullName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <SharedButton variant="dangerOutline" onClick={() => setAssignModalOpen(false)}>
              إلغاء
            </SharedButton>
            <SharedButton
              variant="success"
              disabled={!selectedResearcher}
              onClick={handleAssignResearcher}
            >
              إسناد
            </SharedButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function AssistanceDataTypes() {
  const { imagesPath } = useImagesPathContext();
  const [officeId, setOfficeId] = useState<number | string>(() =>
    localStorage.getItem("role") == "O" ? JSON.parse(localStorage.getItem("mainUser") || "{}").Office_Id : 0
  );
  const [subventionTypeId, setSubventionTypeId] = useState<number | string>(0);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const [status, setStatus] = useState<number | string>(0);

  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AssistanceRow | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [allResearcher, setAllResearcher] = useState([]);

  const toast = useToast();

  // Offices
  const { data: officesData, isLoading: officesLoading, isError: officesError } = useGetOffices(0, 200);
  const { officeOptions, officeNameById } = useOfficeOptions(officesData?.rows);

  useEffect(() => {
    const getAllReserchers = async () => {
      const response = await executeProcedure("huv9xyVC+fwJ3j0ba/1kU5jVjQS03pY1ANdxZtdPdRU=", `${officeId}#1#1000`);
      setAllResearcher(response.rows);
    };
    getAllReserchers();
  }, [officeId]);

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
    useGetAssistanceData(officeId, subventionTypeId, status, offset, PAGE_SIZE);

  const rows = (data?.rows ?? []) as AssistanceRow[];
  const totalRows = Number(data?.decrypted.data.Result[0].AssistancesCount) || 1;

  const { approve, reject, isPending } = useAssistanceActions(() => refetch());

  const showInitialSpinner = isLoading || (isFetching && rows.length === 0);

  const formatDateTime = (date?: string) => {
    if (!date) return "—";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";

    return d.toLocaleString("en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const openDetailsModal = useCallback((row: AssistanceRow) => {
    setSelectedRow(row);
    setPdfFile(null);
    setDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setDetailsModalOpen(false);
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

  const handleAssignResearcher = (updatedRow: AssistanceRow) => {
    setSelectedRow(updatedRow);
    refetch();
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
        key: "ResearcherName",
        header: "الباحث",
        width: "14%",
        render: (r: AnyRec) => {
          const rr = r as AssistanceRow;
          return rr.ResreacherName || "غير مسند";
        },
      },
      {
        key: "Status",
        header: "الحالة",
        width: "12%",
        render: (r: AnyRec) => {
          const status = (r as AssistanceRow).Status;
          const fileName = (r as AssistanceRow).ResreachFileName;
          if (status === "مقبول" || status === "مرفوض") {
            return (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${imagesPath}/${fileName}.pdf`}
                style={{
                  color: "#5555ff",
                  textUnderlineOffset: 4,
                  textDecoration: "underline"
                }}
              >
                {status}
              </a>
            );
          }
          return <span>{status || "معلق"}</span>;
        },
      },
      {
        key: "__actions",
        header: "الإجراءات",
        width: "6%",
        render: (r: AnyRec) => (
          <SharedButton
            variant="secondary"
            size="sm"
            onClick={() => openDetailsModal(r as AssistanceRow)}
            leftIcon={<HiDotsHorizontal />}
          >
            عرض
          </SharedButton>
        ),
      },
    ],
    [officeNameById, openDetailsModal]
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
      {localStorage.getItem("role") == "M" && (
        <AssistanceFiltersInline
          officeId={officeId}
          setOfficeId={(v) => { setPage(1); setOfficeId(v); }}
          subventionTypeId={subventionTypeId}
          setSubventionTypeId={(v) => { setPage(1); setSubventionTypeId(v); }}
          status={status}
          setStatus={(v: any) => { setPage(1); setStatus(v); }}
          officeOptions={officeOptions}
          subventionOptions={subventionOptions}
          isDisabled={filtersDisabled}
        />
      )}

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

      {/* مودال عرض التفاصيل */}
      <AssistanceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        row={selectedRow}
        onAssignResearcher={handleAssignResearcher}
        onApprove={approve}
        onReject={reject}
        isPending={isPending}
        isActing={isActing}
        pdfFile={pdfFile}
        onFileChange={onFileChange}
        allResearcher={allResearcher}
        refetch={refetch}
      />
    </Box>
  );
}