import {
  Box, Heading, useToast, Collapse, HStack, Button, Text, IconButton, Spinner,
  useDisclosure, Flex,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";

import SharedButton from "../../../Components/SharedButton/Button";
import SectionDivider from "../../../Components/Divider/SectionDivider";

import OfficeDetailsSection, {
  type OfficeDetailsHandle, type OfficeDetailsValues,
} from "./OfficeDetailsSection";

import BankDetailsSection, {
  type BankDetailsHandle, type BankDetailsValues,
} from "./BankDetailsSection";

import BankAccountSection from "./BankAccountSection";

import { doTransaction, doMultiTransaction } from "../../../api/apiClient";
import useUpdateOffice from "./hooks/useUpdateOffice";
import { useGetDashBankData } from "./hooks/useGetDashBankData";
import { deleteBankAccount } from "./Services/addAccount";

import { OFFICE_TABLE, BANK_TABLE, BANK_COLS, serviceTypes } from "./helpers/constants";
import { normalizeBank, scrub, extractNewOfficeId } from "./helpers/utils";
import ConfirmDeleteDialog from "./Components/ConfirmDeleteDialog";

/* ===================== Component ===================== */
export default function AddOffice() {
  const navigate = useNavigate();
  const toast = useToast();

  const officeRef = useRef<OfficeDetailsHandle>(null);
  const bankRef   = useRef<BankDetailsHandle>(null);

  // 👇 ref لتثبيت ID الصورة خلال الجلسة (الأصلي أو المرفوع)
  const photoIdRef = useRef<string>("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankDetailsValues[]>([]);
  const formAnchorRef = useRef<HTMLDivElement | null>(null);
  const [photoId, setPhotoId] = useState("");
  const [extraPhotoId, setExtraPhotoId] = useState("");

  // وضع التعديل
  const location = useLocation();
  const [qs] = useSearchParams();
  const editId = qs.get("edit");
  const isEdit = Boolean(editId || location.state?.mode === "edit");

  console.log(location.state?.row);
  
  // صف قادم من اللستة
  const row = location.state?.row as
    | {
        id: number | string;
        companyName?: string;
        phone?: string;
        city?: string | number;
        cityId?: string | number;
        isActive?: boolean;
        zakatFitr?: boolean;
        address?: string;
        latitude?: string | number;
        longitude?: string | number;
        photoName?: string;
        OfficePhotoName?: string;
        OfficePhotoName_Id?: string|number;
      }
    | undefined;

  // قيم مبدئية لصفحة التفاصيل
  const defaultValues: Partial<OfficeDetailsValues> | undefined = useMemo(() => {
    if (!row) return undefined;

    const photoIdFromRow =
      (row as any).OfficePhotoName_Id ?? (row as any).photoId ?? "";

    const photoNameForPreview =
      (row as any).OfficePhotoName ?? (row as any).photoName ?? "";
      console.log(photoIdFromRow);
      console.log(photoNameForPreview);

      
    return {
      officeName: row.OfficeName ?? "",
      phoneNum: row.PhoneNum ?? "",
      cityId: String(row.City_Id ?? ""),
      address: row.Address ?? "",
      isActive: Boolean(row.IsActive),
      zakatFitr: Boolean(row.ZakatFitr ?? row.zakatFitr ?? false),
      officeLatitude: row.OfficeLatitude != null ? String(row.OfficeLatitude) : "",
      officeLongitude: row.OfficeLongitude != null ? String(row.OfficeLongitude) : "",
      officePhotoName: String(photoIdFromRow || ""), // نخزن ID الصورة
      ...(photoNameForPreview
        ? { officePhotoDisplayName: String(photoNameForPreview) }
        : {}), // للمعاينة
        officeHeaderPhotoNamePreview: row.HeaderPhotoName,
    } as any;
  }, [row]);


  // 👇 ثبّت الـID الأصلي في ref عند دخول وضع التعديل
  useEffect(() => {
    if (isEdit) {
      photoIdRef.current = String(
        (row as any)?.OfficePhotoName_Id ??
        (row as any)?.photoId ??
        (defaultValues as any)?.officePhotoName ??
        ""
      );
    }
  }, [isEdit, row, defaultValues]);

  const handleOpenAdd = () => {
    setIsAddOpen(true);
    setTimeout(() => formAnchorRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  /* -------------------- جلب حسابات المكتب في وضع التعديل -------------------- */
  const officeIdForBanks = editId || row?.id || null;
  const {
    data: bankData,
    isLoading: banksLoading,
    isError: banksError,
    error: banksErr,
    refetch: refetchBanks,
  } = useGetDashBankData(officeIdForBanks as any, 0, 200);

  type DisplayBank = BankDetailsValues & {
    serverId?: number | string;
    bankNameLabel?: string;
    accountTypeLabel?: string;
    serviceTypeLabel?: string;
  };

  const serverBankAccounts: DisplayBank[] = useMemo(() => {
    return (bankData?.rows ?? []).map((r: any) => ({
      serverId: r.id,
      bankId: String(r.bankId ?? ""),
      accountNumber: String(r.accountNumber ?? ""),
      openingBalance: String(r.openingBalance ?? "0"),
      accountTypeId: String(r.accountTypeId ?? ""),
      serviceTypeId: String(r.serviceTypeId ?? ""),
      hasCard: !!r.hasCard,
      isEnabled: !!r.isActive,
      bankNameLabel: r.bankName ?? "",
      accountTypeLabel: r.accountTypeName ?? "",
      serviceTypeLabel: r.serviceTypeName ?? "",
    })) as DisplayBank[];
  }, [bankData?.rows]);

  const displayAccounts: DisplayBank[] = useMemo(() => {
    if (!isEdit) return bankAccounts as DisplayBank[];
    return [...serverBankAccounts, ...(bankAccounts as DisplayBank[])];
  }, [isEdit, serverBankAccounts, bankAccounts]);

  /* -------------------- حذف محلي / سيرفر -------------------- */
  const handleDeleteLocal = (idx: number) => {
    setBankAccounts((prev) => prev.filter((_, i) => i !== idx));
    toast({ title: "تم حذف الحساب من الجدول.", status: "info" });
  };

  const confirm = useDisclosure();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
  const askDeleteServer = (serverId: string | number) => { setPendingDeleteId(serverId); confirm.onOpen(); };
  const doDeleteServer = async () => {
    if(serverBankAccounts.length<=1){
       toast({ title: "يجب أن يكون للمكتب حساب بنكي واحد على الأقل.", status: "error" });
       return
    }
    if (!pendingDeleteId) return;
    try {
      const res = await deleteBankAccount(pendingDeleteId);
      if (!(res as any)?.success) throw new Error((res as any)?.error || "Delete failed");
      toast({ title: "تم حذف الحساب.", status: "success" });
      await refetchBanks();
    } catch (e: any) {
      toast({ title: "فشل حذف الحساب", description: e?.message || "حدث خطأ غير متوقع", status: "error" });
    } finally {
      setPendingDeleteId(null);
      confirm.onClose();
    }
  };

  /* -------------------- إضافة حساب بنكي -------------------- */
  const handleAddBankLocal = async () => {
    const bank = await bankRef.current?.submit();
    if (!bank) { toast({ title: "من فضلك املأ حقول البنك.", status: "error" }); return; }
    const nb = normalizeBank(bank);
    setBankAccounts((prev) => [...prev, nb]);
    setIsAddOpen(false);
    toast({ title: "تم حفظ الحساب في الجدول.", status: "success" });
  };

  const handleAddBankInEdit = async () => {
    if (!isEdit) { await handleAddBankLocal(); return; }
    const bank = await bankRef.current?.submit();
    if (!bank) { toast({ title: "من فضلك املأ حقول البنك.", status: "error" }); return; }
    const nb = normalizeBank(bank);

    const officeId = String(editId || row?.id || "");
    if (!officeId) { toast({ title: "لا يمكن إضافة حساب: رقم المكتب غير معروف.", status: "error" }); return; }

    const ColumnsValues = [
      "0",
      officeId,
      String(Number(nb.bankId) || 0),
      scrub(nb.accountNumber),
      String(Number(nb.openingBalance) || 0),
      String(Number(nb.accountTypeId) || 0),
      String(Number(nb.serviceTypeId) || 0),
      nb.hasCard ? "1" : "0",
      nb.isEnabled ? "1" : "0",
    ].join("#");

    try {
      const res = await doTransaction({
        TableName: BANK_TABLE,
        WantedAction: 0,
        ColumnsNames: BANK_COLS,
        ColumnsValues,
        PointId: 0,
      });

      if ((res as any)?.success) {
        setIsAddOpen(false);
        toast({ title: "تم إضافة الحساب البنكي للمكتب.", status: "success" });
        refetchBanks();
      } else {
        toast({ title: "فشل إضافة الحساب", description: (res as any)?.error || "Transaction Failed", status: "error" });
      }
    } catch (e: any) {
      toast({ title: "خطأ أثناء الإضافة", description: e?.message, status: "error" });
    }
  };

  /* -------------------- إضافة مكتب + حسابات (جديد) -------------------- */
  const handleAddOfficeAndBanks = async () => {
    const office: OfficeDetailsValues | null = await officeRef.current?.submit();
    if (!office) { toast({ title: "راجِع حقول المكتب.", status: "error" }); return; }

    if (bankAccounts.length === 0) {
      toast({ title: "أضف حسابًا بنكيًا واحدًا على الأقل.", status: "error" });
      return;
    }

    const MultiTableName = [OFFICE_TABLE, ...Array(bankAccounts.length).fill(BANK_TABLE)].join("^");

    const officeCols =
      "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName#HeaderPhotoName#ZakatFitr";
    const bankCols = BANK_COLS;

    const MultiColumnsNames = officeCols + "^" + Array(bankAccounts.length).fill(bankCols).join("^");
    console.log( office );
    
    const officePart = [
      "0",
      scrub(office.officeName),
      scrub((office as any).officeLatitude) || "",
      scrub((office as any).officeLongitude) || "",
      String(Number((office as any).cityId) || 0),
      scrub((office as any).phoneNum) || "",
      scrub((office as any).address) || "",
      office.isActive ? "1" : "0",
      scrub((office as any).officePhotoName) || "", // ID بعد الرفع
      extraPhotoId!=""?extraPhotoId:"",
      (office as any).zakatFitr ? "1" : "0",
    ].join("#");
    console.log( officePart);

    const bankParts = bankAccounts.map((b) => {
      const nb = normalizeBank(b);
      return [
        "0",
        "0",
        String(Number(nb.bankId) || 0),
        scrub(nb.accountNumber),
        String(Number(nb.openingBalance) || 0),
        String(Number(nb.accountTypeId) || 0),
        String(Number(nb.serviceTypeId) || 0),
        nb.hasCard ? "1" : "0",
        nb.isEnabled ? "1" : "0",
      ].join("#");
    });

    const MultiColumnsValues = [officePart, ...bankParts].join("^");

    const res = await doMultiTransaction({
      MultiTableName,
      MultiColumnsNames,
      MultiColumnsValues,
      WantedAction: 0,
      PointId: 0,
    });

    if (res.success) {
      const newOfficeId = extractNewOfficeId((res as any).decrypted) || null;
      toast({ title: "تم حفظ المكتب والحسابات البنكية.", status: "success" });
      navigate("/maindashboard/offices/created", {
        state: { newOfficeId, pointId: 0, office, bankAccounts },
        replace: true,
      });
    } else {
      toast({ title: "فشل الحفظ", description: (res as any)?.error || "Transaction Failed", status: "error" });
    }
  };

  /* -------------------- حفظ المكتب (التعديل) -------------------- */
  const updateMutation = useUpdateOffice();
  const handleSave = async () => {
    if (!isEdit) { await handleAddOfficeAndBanks(); return; }

    const office = await officeRef.current?.submit();
    if (!office) { toast({ title: "راجع بيانات المكتب.", status: "error" }); return; }

    // 👇 ناخد من الحقل لو فيه قيمة، وإلا fallback على الـref (الأصلي/آخر مرفوع)
    const currentId = String(office.officePhotoName ?? "").trim();
    const photoIdToSend = currentId && currentId !== "0" ? currentId : photoIdRef.current;

    const payload = {
      id: editId || row?.id || "",
      officeName: office.officeName,
      cityId: office.cityId,
      phone: office.phoneNum,
      address: office.address,
      isActive: office.isActive,
      zakatFitr: (office as any).zakatFitr ?? false,
      latitude: office.officeLatitude ?? "",
      longitude: office.officeLongitude ?? "",
      photoId: photoIdToSend,   // دايمًا ID
      pointId: 0,
      dataToken: "Zakat", // ✅ تمرير DataToken
      HeaderPhotoName: extraPhotoId || "",
    } as const;
    console.log(payload);
    
    try {
      const res = await updateMutation.mutateAsync(payload);
      
      if (res.decrypted.result=="200") {
        toast({ title: "تم حفظ التعديلات.", status: "success" });
        navigate("/maindashboard/offices");
      } else {
        toast({ title: "فشل حفظ التعديلات", description: (res as any)?.error || "", status: "error" });
      }
    } catch (e: any) {
      toast({ title: "خطأ أثناء التعديل", status: "error" });
    }
  };
  const handleActiveChange = async (accountId : string | number, isEnabled: boolean) => {
    try {
      const res = await doTransaction({
        TableName: BANK_TABLE,
        WantedAction: 1,
        ColumnsNames: "Id#IsActive",
        ColumnsValues: `${accountId}#${isEnabled ? "False" : "True"}`,
        PointId: 0,
      });
      if (res.success) {
        toast({ title: "تم تغيير حالة الحساب.", status: "success" });
      } else {
        toast({ title: "فشل تغيير حالة الحساب", description: (res as any)?.error || "", status: "error" });
      }
    } catch (e: any) {
      toast({ title: "خطأ أثناء تغيير حالة الحساب", status: "error" });
    } finally {
      refetchBanks();
    }
  };

  if (banksLoading && isEdit) {
    return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
  }
  console.log(displayAccounts);
  return (
    <Box p={4} dir="rtl">
      <Heading size="md" mb={4}>{isEdit ? "تعديل مكتب" : "إضافة مكتب"}</Heading>

      {/* بيانات المكتب */}
      <OfficeDetailsSection
        ref={officeRef}
        defaultValues={defaultValues}
        // 👇 أي تغيير في صورة المكتب يحدّث الـref
        onPhotoIdChange={setPhotoId}
        onExtraPhotoIdChange={setExtraPhotoId}
      />

      <SectionDivider my={8} />

      {/* شريط أعلى جدول الحسابات */}
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="700">الحسابات البنكية</Text>
        <IconButton
          aria-label="إضافة حساب بنكي"
          icon={<AddIcon />}
          size="sm"
          rounded="md"
          bg="#13312C"
          color="white"
          _hover={{ bg: "#0f2622" }}
          onClick={handleOpenAdd}
        />
      </HStack>

      {isEdit && banksLoading ? (
        <HStack p={4} border="1px dashed" borderColor="gray.300" rounded="lg" color="gray.500">
          <Spinner size="sm" />
          <Text>جارِ تحميل حسابات المكتب…</Text>
        </HStack>
      ) : banksError ? (
        <Box p={4} border="1px dashed" borderColor="red.300" rounded="lg" color="red.600">
          تعذر جلب الحسابات البنكية: {(banksErr as Error)?.message || ""}
        </Box>
      ) : displayAccounts.length === 0 ? (
        <Box p={4} border="1px dashed" borderColor="gray.300" rounded="lg" color="gray.500">
          لا توجد حسابات بعد — اضغط زر الإضافة بالأعلى.
        </Box>
      ) : (
        displayAccounts.map((b: DisplayBank, i: number) => (
          <BankAccountSection
            isActive={b.isEnabled}
            onActiveChange={() => {
              handleActiveChange(b.serverId!, b.isEnabled!);
            }}
            key={(b.serverId ?? i) as any}
            index={i + 1}
            bankName={b.bankId}
            accountNumber={b.accountNumber}
            openingBalance={b.openingBalance}
            accountType={b.accountTypeId}
            serviceType={b.serviceTypeId}
            hasCard={!!b.hasCard}
            serviceTypeLabel={Number(b.serviceTypeId)==1?"زكاة":"صدقة"}
            onDelete={
              isEdit
                ? (b.serverId ? () => askDeleteServer(b.serverId!) : undefined)
                : () => handleDeleteLocal(i)
            }
            onEdit={() => {}}
            onAdd={handleOpenAdd}
          />
        ))
      )}

      <SectionDivider my={8} />

      <Collapse in={isAddOpen} animateOpacity>
        <Box ref={formAnchorRef}>
          <BankDetailsSection ref={bankRef} displayAccounts={displayAccounts} serviceTypes={serviceTypes} />
          <HStack justify="flex-end" mt={3} spacing={3}>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
            <Button colorScheme={isEdit ? "teal" : undefined} onClick={handleAddBankInEdit}>
              {isEdit ? "حفظ الحساب" : "حفظ الحساب"}
            </Button>
          </HStack>
        </Box>
      </Collapse>

      <Box mt={8} display="flex" justifyContent="flex-end" gap={4}>
        <SharedButton onClick={() => navigate(-1)} variant="outline">إلغاء</SharedButton>
        <SharedButton onClick={handleSave} isLoading={updateMutation.isPending}>
          {isEdit ? "حفظ التعديلات" : "إضافة"}
        </SharedButton>
      </Box>

      <ConfirmDeleteDialog
        isOpen={confirm.isOpen}
        onClose={confirm.onClose}
        onConfirm={doDeleteServer}
      />
    </Box>
  );
}
