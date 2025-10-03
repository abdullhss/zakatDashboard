import {
  Box, VStack, HStack, Switch, Text,
} from "@chakra-ui/react";
import {
  DetailCard, SectionHeader, SectionTitle,
  DetailGrid, DetailRow, SectionDivider,
  TableCard, TableHeader, TableRow,
} from "./styles/DetailUi";
import MapStrip from "../../../Components/Map/MapStrip";
import { useMemo } from "react";
import { useBanksQuery } from "../../MainDepartment/Banks/hooks/useGetBanks";
import { useCitiesQuery } from "../Cities/hooks/useCities";

/* ===== Types ===== */
export type Office = {
  officeName: string;
  phoneNum: string;
  cityName?: string;            // ممكن ييجي نص جاهز
  cityId?: string | number;     // أو ID
  address: string;
  isActive: boolean;
  officeLatitude?: string | number;
  officeLongitude?: string | number;
};

export type BankAccount = {
  bankName?: string;            // ممكن ييجي نص جاهز
  bankId?: string | number;     // أو ID
  iban?: string;                // IBAN/Swift إن وجد
  accountNumber: string;
  openingBalance: number | string;
  accountTypeId?: string | number;
  accountTypeName?: string;     // لو جاي جاهز نص
  serviceTypeId?: string | number;
  serviceTypeName?: string;     // لو جاي جاهز نص
  hasCard?: boolean;
  isActive?: boolean;
};

/* ===== Helpers ===== */
const ACCOUNT_TYPE_LABEL: Record<string | number, string> = {
  1: "جاري", 2: "توفير", checking: "جاري", saving: "توفير",
};
const SERVICE_TYPE_LABEL: Record<string | number, string> = {
  1: "صدقة", 2: "زكاة", sadaka: "صدقة", zakat: "زكاة",
};

function labelOf(map: Record<any, string>, v: any) {
  return map[v] ?? String(v ?? "");
}
function fmtCurrency(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("ar-EG", { minimumFractionDigits: 2 }) : String(v ?? "");
}

export default function OfficeDetailsView({
  office,
  accounts,
}: {
  office?: Partial<Office>;
  accounts?: Partial<BankAccount>[];
}) {
  // ===== fetch lookup lists =====
  const { data: banksData }  = useBanksQuery(0, 200);
  const { data: citiesData } = useCitiesQuery(0, 200);

  const bankNameById = useMemo(() => {
    const rows = banksData?.rows ?? [];
    const map: Record<string, string> = {};
    rows.forEach((r: any) => {
      const id   = String(r.Id ?? r.BankId ?? r.id ?? r.code ?? r.Code ?? "");
      const name = String(r.BankName ?? r.Name ?? r.Bank ?? r.title ?? r.Title ?? "");
      if (id) map[id] = name;
    });
    return map;
  }, [banksData]);

  const cityNameById = useMemo(() => {
    const rows = citiesData?.rows ?? [];
    const map: Record<string, string> = {};
    rows.forEach((r: any) => {
      const id   = String(r.Id ?? r.CityId ?? r.id ?? r.code ?? r.Code ?? "");
      const name = String(r.CityName ?? r.Name ?? r.City ?? r.Title ?? r.title ?? "");
      if (id) map[id] = name;
    });
    return map;
  }, [citiesData]);

  // ===== defensives =====
  const safeOffice: Office = {
    officeName: office?.officeName ?? "",
    phoneNum: office?.phoneNum ?? "",
    cityName: office?.cityName,
    cityId: office?.cityId,
    address: office?.address ?? "",
    isActive: !!office?.isActive,
    officeLatitude: office?.officeLatitude,
    officeLongitude: office?.officeLongitude,
  };

  const lat = Number(safeOffice.officeLatitude ?? 24.7136);
  const lng = Number(safeOffice.officeLongitude ?? 46.6753);

  // resolve city display
  const cityDisplay =
    safeOffice.cityName ??
    (safeOffice.cityId != null ? (cityNameById[String(safeOffice.cityId)] ?? String(safeOffice.cityId)) : "—");

  // normalize accounts
  const accs: BankAccount[] = (accounts ?? []).map((a) => ({
    bankName: a.bankName,
    bankId: a.bankId,
    iban: a.iban ?? "",
    accountNumber: a.accountNumber ?? "",
    openingBalance: a.openingBalance ?? 0,
    accountTypeId: a.accountTypeId,
    accountTypeName: a.accountTypeName,
    serviceTypeId: a.serviceTypeId,
    serviceTypeName: a.serviceTypeName,
    hasCard: !!a.hasCard,
    isActive: !!a.isActive,
  }));

  return (
    <VStack align="stretch" spacing={6}>
      <DetailCard>
        <SectionHeader>
          <SectionTitle>تفاصيل المكتب</SectionTitle>
          <HStack gap={2}>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
              تفعيل ظهوره في التطبيق
            </Text>
            <Switch isChecked={safeOffice.isActive} isReadOnly />
          </HStack>
        </SectionHeader>

        <DetailGrid dir="rtl">
          <DetailRow label="اسم المكتب" value={safeOffice.officeName} />
          <DetailRow label="رقم الهاتف" value={safeOffice.phoneNum} />
          <DetailRow label="المدينة" value={cityDisplay} />
          <DetailRow label="العنوان" value={safeOffice.address} />
        </DetailGrid>

        <SectionDivider />

        <Box dir="rtl" mb={2}>
          <Text fontWeight="700" color="gray.700" _dark={{ color: "gray.100" }} mb={2} textAlign="center">
            موقع المكتب على الخريطة
          </Text>
          <MapStrip center={{ lat, lng }} marker={{ lat, lng }} />
        </Box>
      </DetailCard>

      <TableCard>
        <TableHeader>الحساب البنكي</TableHeader>

        <TableRow
          columns={8}
          cells={[
            "اسم البنك",
            "رقم الحساب",
            "IBAN",
            "رصيد افتتاحي",
            "نوع الحساب",
            "نوع الخدمة",
            "بطاقة مصرفية",
            "تفعيل الحساب",
          ]}
        />

        {accs.map((a, idx) => {
          const bankDisplay =
            a.bankName ??
            (a.bankId != null ? (bankNameById[String(a.bankId)] ?? String(a.bankId)) : "—");

          const accountTypeDisplay = labelOf(ACCOUNT_TYPE_LABEL, a.accountTypeName ?? a.accountTypeId);
          const serviceTypeDisplay = labelOf(SERVICE_TYPE_LABEL, a.serviceTypeName ?? a.serviceTypeId);

          return (
            <TableRow
              key={idx}
              columns={8}
              cells={[
                bankDisplay,
                a.accountNumber,
                a.iban || "—",
                fmtCurrency(a.openingBalance),
                accountTypeDisplay,
                serviceTypeDisplay,
                <HStack justify="center" key="card">
                  <Switch isChecked={!!a.hasCard} isReadOnly />
                </HStack>,
                <HStack justify="center" key="active">
                  <Switch isChecked={!!a.isActive} isReadOnly />
                </HStack>,
              ]}
            />
          );
        })}
      </TableCard>
    </VStack>
  );
}
