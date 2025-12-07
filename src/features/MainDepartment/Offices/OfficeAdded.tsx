import {
  Box, VStack, HStack, Switch, Text, Tabs, TabList, Tab, TabPanels, TabPanel,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import MapStrip from "../../../Components/Map/MapStrip";
import {
  DetailCard, SectionHeader, SectionTitle, TwoCols, KVRow, SectionDivider,
  TableCard, TableHeader, TableRow,
  TableRow2,
} from "./styles/DetailUi";
import { useBanksQuery } from "../Banks/hooks/useGetBanks";
import { useGetAccountTypes } from "./hooks/useGetAccountTypes";

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
    2: "صدقة", 
    1: "زكاة", 
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

    /* البنوك */
    const { data: banksData } = useBanksQuery(0, 200);
  
    /* أنواع الحسابات */
    const { data: accTypesData } = useGetAccountTypes(0, 200);
  
    console.log(office);
    
  return (
    <VStack align="stretch" spacing={6} p={4} dir="rtl">
      {/* ===== تفاصيل المكتب (مطابق لفيجما) ===== */}
      <DetailCard>
        <SectionHeader>
          <SectionTitle fontSize={20}>تفاصيل المكتب</SectionTitle>
          {/* <HStack gap={3}>
            <Text fontSize="sm" color="gray.700">تفعيل ظهوره في التطبيق</Text>
            <Switch isChecked={office.isActive} isReadOnly />
          </HStack> */}
        </SectionHeader>

        <div
          style={{
            padding: "1rem",              // p-4
            display: "flex",              // flex
            flexDirection: "column",      // flex-col
            gap: "1.5rem",                  // gap-8
            width: "100%",                // w-full
            fontWeight:"500",
            backgroundColor:"#24645E55",
            borderRadius:"0.5rem"
          }}
        >
          <div
            style={{
              width: "100%",              // w-full
              display: "flex",            // flex
              alignItems: "center",       // items-center
              gap:"10px"
            }}
          >
            <span>اسم المكتب :</span>
            <span>{office.officeName}</span>
          </div>
          <div
            style={{
              width: "100%",              // w-full
              display: "flex",            // flex
              alignItems: "center",       // items-center
              gap:"10px"
            }}
          >
            <span>رقم الهاتف :</span>
            <span>{office.phoneNum}</span>
          </div>
          {/* <div
            style={{
              width: "100%",              // w-full
              display: "flex",            // flex
              alignItems: "center",       // items-center
              justifyContent: "space-between", // justify-between
            }}
          >
            <span>المدينة</span>
            <span>{office.cityName}</span>
          </div> */}
          <div
            style={{
              width: "100%",              // w-full
              display: "flex",            // flex
              alignItems: "center",       // items-center
              gap:"10px"
            }}
          >
            <span>العنوان :</span>
            <span>{office.address}</span>
          </div>
        </div>

        <Box mt={6}>
          <Text fontWeight="800" color="gray.700" textAlign="center" mb={2}>
            موقع المكتب على الخريطة
          </Text>
          <MapStrip center={{ lat, lng }} marker={{ lat, lng }} />
        </Box>
      </DetailCard>

      {/* ===== الحساب البنكي ===== */}
      <TableCard
       style={{border:"1px solid #24645E" , padding:6 , backgroundColor:"#24645E55"}}
      >
        <TableHeader nowhite={true}>الحساب البنكي</TableHeader>

        {/* صف العناوين (زي فيجما) */}
        <TableRow
          withBorder={false}
          cells={[
            "اسم البنك",
            "رقم الحساب",
            // "الصرف التجاري الوطني",
            "رصيد افتتاحي",
            "نوع الحساب",
            "نوع الخدمة",
          ]}
        />

        {/* البيانات */}
        {accounts.length === 0 ? (
          <Box px={5} py={6}>لا توجد حسابات</Box>
        ) : accounts.map((a, i) => (
          <TableRow2
            key={i}
            cells={[
                banksData?.rows.find((b: any) => b.Id === Number(a.bankName))?.BankName
              ,
              a.accountNumber,
              // a.iban,
              fmtCurrency(a.openingBalance),
              a.accountTypeName || accountTypeLabel(a.accountTypeId),
              a.serviceTypeName || serviceTypeLabel(a.serviceTypeId),
            ]}
          />
        ))}

        {/* سطر خيارات البطاقة/التفعيل (اختياري للعرض أسفل الجدول) */}
        {/* <Box px={5} py={3} w="full" borderTopWidth="1px" borderColor="gray.100">
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
        </Box> */}
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
