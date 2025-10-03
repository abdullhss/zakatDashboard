// src/features/MainDepartment/Offices/AddOffice.tsx
import {
  Box,
  Heading,
  useToast,
  Collapse,
  HStack,
  Button,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import SharedButton from "../../../Components/SharedButton/Button";
import SectionDivider from "../../../Components/Divider/SectionDivider";

import OfficeDetailsSection, {
  type OfficeDetailsHandle,
  type OfficeDetailsValues,
} from "./OfficeDetailsSection";

import BankDetailsSection, {
  type BankDetailsHandle,
  type BankDetailsValues,
  type Option,
} from "./BankDetailsSection";

import BankAccountSection from "./BankAccountSection";

import { doTransaction, doMultiTransaction } from "../../../api/apiClient";

/* ===================== ثوابت ===================== */
// أسماء الجداول (Encrypted) — غيّرها لو مختلفة عندك
const OFFICE_TABLE = "msDmpDYZ2wcHBSmvMDczrg==";
const BANK_TABLE   = "7OJ/SnO8HWuJK+w5pE0FXA==";

// اختيارات الدروب داون (لو عندك API استبدلها)
const accountTypes: Option[] = [
  { value: "1", label: "جاري" },
  { value: "2", label: "توفير" },
];
const serviceTypes: Option[] = [
  { value: "1", label: "صدقة" },
  { value: "2", label: "زكاة"  },
];

/* خرائط تحويل نص→ID */
const accountTypeMap: Record<string, number> = {
  checking: 1, saving: 2, "1": 1, "2": 2,
};
const serviceTypeMap: Record<string, number> = {
  sadaka: 1, zakat: 2, "1": 1, "2": 2,
};

/* ===================== Helpers ===================== */
const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");
const toId = (map: Record<string, number>, v: unknown): number => {
  const s = String(v ?? "");
  const n = Number(s);
  if (Number.isFinite(n) && s !== "" && !Number.isNaN(n)) return n;
  return map[s] ?? 0;
};

function normalizeBank(b: BankDetailsValues): BankDetailsValues {
  return {
    ...b,
    bankId: String(Number(b.bankId) || 0),
    accountTypeId: String(toId(accountTypeMap, b.accountTypeId)),
    serviceTypeId:  String(toId(serviceTypeMap,  b.serviceTypeId)),
    openingBalance: String(Number(b.openingBalance) || 0),
    accountNumber: scrub(b.accountNumber),
  };
}

// حاول نستخلص OfficeId من رد السيرفر بعد المولتي ترانزاكشن
function extractNewOfficeId(dec: any): string | null {
  try {
    const d = dec?.data ?? {};
    const candidates = [
      d?.NewId, d?.OfficeId, d?.Id,
      d?.Result?.[0]?.NewId, d?.Result?.[0]?.OfficeId, d?.Result?.[0]?.Id,
      dec?.newId, dec?.id, dec?.resultId,
    ].filter((x) => x != null);
    return candidates.length ? String(candidates[0]) : null;
  } catch {
    return null;
  }
}

/* ===================== Component ===================== */
export default function AddOffice() {
  const navigate = useNavigate();
  const toast = useToast();

  const officeRef = useRef<OfficeDetailsHandle>(null);
  const bankRef   = useRef<BankDetailsHandle>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankDetailsValues[]>([]);
  const formAnchorRef = useRef<HTMLDivElement | null>(null);

  /* فتح فورم إضافة حساب بنك */
  const handleOpenAdd = () => {
    setIsAddOpen(true);
    setTimeout(() => formAnchorRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  /* حفظ حساب بنك في الجدول المحلي فقط */
  const handleAddBankLocal = async () => {
    const bank = await bankRef.current?.submit();
    if (!bank) { toast({ title: "من فضلك املأ حقول البنك.", status: "error" }); return; }
    const nb = normalizeBank(bank);
    setBankAccounts((prev) => [...prev, nb]);
    setIsAddOpen(false);
    toast({ title: "تم حفظ الحساب في الجدول.", status: "success" });
  };

  /* حذف حساب بنك من الجدول المحلي */
  const handleDeleteLocal = (idx: number) => {
    setBankAccounts((prev) => prev.filter((_, i) => i !== idx));
    toast({ title: "تم حذف الحساب من الجدول.", status: "info" });
  };

  /* إضافة حساب بنكي فقط للداتابيز (DoTransaction) — اختياري */
  const handleAddBankOnlyToDB = async () => {
    const bank = await bankRef.current?.submit();
    if (!bank) { toast({ title: "من فضلك املأ حقول البنك.", status: "error" }); return; }
    const nb = normalizeBank(bank);

    const ColumnsNames =
      "Id#Office_Id#Bank_Id#AccountNum#OpeningBalance#AccountType_Id#ServiceType_Id#AcceptBankCards#IsActive";

    // لو عندك Office_Id معروف استخدمه
    const officeId = 0;

    const ColumnsValues = [
      "0",                                    // Id (insert)
      String(officeId),                       // Office_Id
      String(Number(nb.bankId) || 0),         // Bank_Id
      scrub(nb.accountNumber),                // AccountNum
      String(Number(nb.openingBalance) || 0), // OpeningBalance
      String(Number(nb.accountTypeId) || 0),  // AccountType_Id
      String(Number(nb.serviceTypeId) || 0),  // ServiceType_Id
      nb.hasCard ? "1" : "0",                 // AcceptBankCards
      nb.isEnabled ? "1" : "0",               // IsActive
    ].join("#");

    const pointId = 0;

    const res = await doTransaction({
      TableName: BANK_TABLE,
      WantedAction: 0,
      ColumnsValues,
      PointId: pointId,
      ColumnsNames, // بعض السيرفرات بتحتاجه
    });

    if (res.success) {
      setBankAccounts(prev => [...prev, nb]); // عشان المستخدم يشوفه فورًا
      setIsAddOpen(false);
      toast({ title: "تم إضافة الحساب البنكي في الداتابيز.", status: "success" });
    } else {
      toast({
        title: "فشل إضافة الحساب",
        description: res.error || "Transaction Failed",
        status: "error",
      });
    }
  };

  /* إضافة مكتب + كل الحسابات البنكية (DoMultiTransaction) */
  const handleAddOfficeAndBanks = async () => {
    const office: OfficeDetailsValues | null = await officeRef.current?.submit();
    if (!office) { toast({ title: "راجِع حقول المكتب.", status: "error" }); return; }

    if (bankAccounts.length === 0) {
      toast({ title: "أضف حسابًا بنكيًا واحدًا على الأقل.", status: "error" });
      return;
    }

    // 1) أسماء الجداول بالترتيب: أولاً Office ثم OfficeBank * n
    const MultiTableName = [
      OFFICE_TABLE,
      ...Array(bankAccounts.length).fill(BANK_TABLE),
    ].join("^");

    // 2) أعمدة كل جدول
    const officeCols =
      "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName";
    const bankCols =
      "Id#Office_Id#Bank_Id#AccountNum#OpeningBalance#AccountType_Id#ServiceType_Id#AcceptBankCards#IsActive";

    const MultiColumnsNames =
      officeCols + "^" + Array(bankAccounts.length).fill(bankCols).join("^");

    // 3) قيم المكتب حسب نفس ترتيب officeCols
    const officePart = [
      "0",
      scrub(office.officeName),
      scrub((office as any).officeLatitude) || "",
      scrub((office as any).officeLongitude) || "",
      String(Number((office as any).cityId) || 0),
      scrub((office as any).phoneNum) || "",
      scrub((office as any).address) || "",
      office.isActive ? "1" : "0",
      scrub((office as any).officePhotoName) || "",
    ].join("#");

    // 4) قيم كل حساب بنك
    const bankParts = bankAccounts.map((b) => {
      const nb = normalizeBank(b);
      return [
        "0",                                 // Id
        "0",                                 // Office_Id (السيرفر بيربطه بالسجل الأول)
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
    const pointId = 0;

    const res = await doMultiTransaction({
      MultiTableName,
      MultiColumnsNames,
      MultiColumnsValues,
      WantedAction: 0,
      PointId: pointId,
    });

    if (res.success) {
      const newOfficeId = extractNewOfficeId((res as any).decrypted) || null;
      toast({ title: "تم حفظ المكتب والحسابات البنكية.", status: "success" });

      // الذهاب لصفحة الملخّص ومعانا كل الداتا
      navigate("/maindashboard/offices/created", {
        state: {
          newOfficeId,
          pointId,
          office,
          bankAccounts,
        },
        replace: true,
      });
    } else {
      toast({
        title: "فشل الحفظ",
        description: res.error || "Transaction Failed",
        status: "error",
      });
    }
  };

  return (
    <Box p={4} dir="rtl">
      <Heading size="md" mb={4}>إضافة مكتب</Heading>

      {/* بيانات المكتب */}
      <OfficeDetailsSection ref={officeRef} />

      <SectionDivider my={8} />

      {/* شريط أعلى جدول الحسابات + زر إضافة */}
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

      {/* جدول الحسابات */}
      {bankAccounts.length === 0 ? (
        <Box p={4} border="1px dashed" borderColor="gray.300" rounded="lg" color="gray.500">
          لا توجد حسابات بعد — اضغط زر الإضافة بالأعلى.
        </Box>
      ) : (
        bankAccounts.map((b, i) => (
          <BankAccountSection
            key={i}
            index={i + 1}
            bankName={b.bankId}
            accountNumber={b.accountNumber}
            openingBalance={b.openingBalance}
            accountType={b.accountTypeId}
            serviceType={b.serviceTypeId}
            hasCard={b.hasCard}
            onDelete={() => handleDeleteLocal(i)}
            onEdit={() => {}}
            onAdd={handleOpenAdd}
          />
        ))
      )}

      <SectionDivider my={8} />

      {/* فورم البنك داخل Collapse */}
      <Collapse in={isAddOpen} animateOpacity>
        <Box ref={formAnchorRef}>
          <BankDetailsSection
            ref={bankRef}
            accountTypes={accountTypes}
            serviceTypes={serviceTypes}
          />
          <HStack justify="flex-end" mt={3} spacing={3}>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              إلغاء
            </Button>

            {/* حفظ في الجدول المحلي فقط */}
            <Button onClick={handleAddBankLocal}>
              حفظ الحساب (محلي)
            </Button>

            {/* حفظ الحساب في الداتابيز فقط (اختياري) */}
            <Button colorScheme="teal" onClick={handleAddBankOnlyToDB}>
              حفظ الحساب (DB)
            </Button>
          </HStack>
        </Box>
      </Collapse>

      {/* أزرار أسفل الصفحة */}
      <Box mt={8} display="flex" justifyContent="flex-end" gap={4}>
        <SharedButton onClick={() => navigate(-1)} variant="outline">
          إلغاء
        </SharedButton>

        {/* يحفظ مكتب + كل البنوك معًا (MultiTransaction) */}
        <SharedButton onClick={handleAddOfficeAndBanks}>
          إضافة
        </SharedButton>
      </Box>
    </Box>
  );
}
