import {
  Box, VStack, HStack, Switch, Text, Tabs, TabList, Tab, TabPanels, TabPanel,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import MapStrip from "../../../Components/Map/MapStrip";
import {
  DetailCard, SectionHeader, SectionTitle, TwoCols, KVRow, SectionDivider,
  TableCard, TableHeader, TableRow,
} from "./styles/DetailUi";

/* ================== Types ================== */
type Office = {
  officeName: string;
  phoneNum: string;
  cityName?: string;
  address?: string;
  isActive: boolean;
  officeLatitude?: string | number;
  officeLongitude?: string | number;
};

type BankAccount = {
  // قد يجيلك الاسم أو الـ id — الاتنين اختياريين لمرونة العرض
  bankName?: string;
  bankId?: string | number;

  accountNumber: string;
  iban: string; // الصرف التجاري الوطني
  openingBalance: number | string;

  accountTypeName?: string;
  accountTypeId?: string | number;

  serviceTypeName?: string;
  serviceTypeId?: string | number;

  hasCard?: boolean;
  isActive?: boolean;
};

type LocationState = {
  office?: Partial<Office>;
  bankAccounts?: Partial<BankAccount>[];
  // ممكن ييجي معها newOfficeId أو أي داتا إضافية من المولتي ترانزاكشن
};

/* ================== Helpers ================== */
// لو جالك ID لنوع الحساب/الخدمة حوّله لنص عربي:
const accountTypeLabel = (v: any) => {
  const m: Record<any, string> = { 1: "جاري", 2: "توفير", checking: "جاري", saving: "توفير" };
  return m[v] ?? (v != null ? String(v) : "—");
};
const serviceTypeLabel = (v: any) => {
  const m: Record<any, string> = { 
    1: "صدقة", 
    2: "زكاة", 
    zakat: "زكاة", 
    sadaka: "صدقة" 
  };
  return m[v] ?? (v != null ? String(v) : "—");
};

const fmtCurrency = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString("ar-EG", { minimumFractionDigits: 2 })
    : (v ?? "0");
};

/* ================== View ================== */
export default function OfficeAdded() {
  const { state } = useLocation() as { state: LocationState };

  // حماية من undefined + قيم افتراضية
  const office: Office = {
    officeName: state?.office?.officeName ?? "—",
    phoneNum: state?.office?.phoneNum ?? "—",
    cityName: state?.office?.cityName ?? "—",
    address: state?.office?.address ?? "—",
    isActive: !!state?.office?.isActive,
    officeLatitude: state?.office?.officeLatitude ?? 24.7136,
    officeLongitude: state?.office?.officeLongitude ?? 46.6753,
  };

  // جهّز الحسابات مع Fallbacks للأسماء لو اللي واصل IDs
  const accounts: BankAccount[] = (state?.bankAccounts ?? []).map((a: any) => ({
    bankName: a?.bankName ?? a?.bankLabel ?? (a?.bankId != null ? String(a.bankId) : "—"),
    bankId: a?.bankId,
    accountNumber: a?.accountNumber ?? "—",
    iban: a?.iban ?? "—",
    openingBalance: a?.openingBalance ?? "0",
    accountTypeName: a?.accountTypeName ?? accountTypeLabel(a?.accountTypeId),
    accountTypeId: a?.accountTypeId,
    serviceTypeName: a?.serviceTypeName ?? serviceTypeLabel(a?.serviceTypeId),
    serviceTypeId: a?.serviceTypeId,
    hasCard: !!a?.hasCard,
    isActive: !!a?.isActive,
  }));

  const lat = Number(office.officeLatitude || 24.7136);
  const lng = Number(office.officeLongitude || 46.6753);

  return (
    <VStack align="stretch" spacing={6} p={4} dir="rtl">
      {/* ===== تفاصيل المكتب (مطابق لفيجما) ===== */}
      <DetailCard>
        <SectionHeader>
          <SectionTitle>تفاصيل المكتب</SectionTitle>
          <HStack gap={3}>
            <Text fontSize="sm" color="gray.700">تفعيل ظهوره في التطبيق</Text>
            <Switch isChecked={office.isActive} isReadOnly />
          </HStack>
        </SectionHeader>

        <TwoCols labelColWidth="160px">
          <KVRow label="اسم المكتب" value={office.officeName} />
          <KVRow label="رقم الهاتف" value={office.phoneNum} />
          <KVRow label="المدينة" value={office.cityName} />
          <KVRow label="العنوان" value={office.address} />
        </TwoCols>

        <Box mt={6}>
          <Text fontWeight="800" color="gray.700" textAlign="center" mb={2}>
            موقع المكتب على الخريطة
          </Text>
          <MapStrip center={{ lat, lng }} marker={{ lat, lng }} />
        </Box>
      </DetailCard>

      {/* ===== الحساب البنكي ===== */}
      <TableCard>
        <TableHeader>الحساب البنكي</TableHeader>

        {/* صف العناوين (زي فيجما) */}
        <TableRow
          withBorder={false}
          cells={[
            "اسم البنك",
            "رقم الحساب",
            "الصرف التجاري الوطني",
            "رصيد افتتاحي",
            "نوع الحساب",
            "نوع الخدمة",
          ]}
        />

        {/* البيانات */}
        {accounts.length === 0 ? (
          <Box px={5} py={4} color="gray.500">لا توجد حسابات</Box>
        ) : accounts.map((a, i) => (
          <TableRow
            key={i}
            cells={[
              a.bankName || String(a.bankId ?? "—"),
              a.accountNumber,
              a.iban,
              fmtCurrency(a.openingBalance),
              a.accountTypeName || accountTypeLabel(a.accountTypeId),
              a.serviceTypeName || serviceTypeLabel(a.serviceTypeId),
            ]}
          />
        ))}

        {/* سطر خيارات البطاقة/التفعيل (اختياري للعرض أسفل الجدول) */}
        <Box px={5} py={3} w="full" borderTopWidth="1px" borderColor="gray.100">
          <HStack justify="space-between">
            <HStack>
              <Text>بطاقة مصرفية</Text>
              <Switch size="sm" isChecked={!!accounts[0]?.hasCard} isReadOnly />
            </HStack>
            <HStack>
              <Text>تفعيل الحساب</Text>
              <Switch size="sm" isChecked={!!accounts[0]?.isActive} isReadOnly />
            </HStack>
          </HStack>
        </Box>
      </TableCard>

      {/* تابز مخفية (للتمدد لاحقًا) */}
      <Tabs variant="enclosed" isFitted display="none">
        <TabList>
          <Tab>الحساب البنكي</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>…</TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
