import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  Text,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import SharedButton from "../../../Components/SharedButton/Button";
import { useNavigate } from "react-router-dom";
import { useAddPaymentData } from "./hooks/useAddPaymentData";
import { useGetActiveOffices } from "./hooks/useGetActiveOffices";
import { useGetOfficeProjectsData } from "./hooks/useGetProjectDashData";
import { useGetOfficeBanksData } from "../TransferBanksData/hooks/useGetOfficeBanksData";

const ACTION_TYPES = [
  { id: 1, name: "زكاة", code: "Z" },
  { id: 2, name: "صدقة", code: "S" },
];

const ZAKAT_TYPES_HARDCODED = [
  { Id: 1, ZakatTypeName: "الفقراء والمساكين" },
  { Id: 2, ZakatTypeName: "العاملين عليها" },
  { Id: 3, ZakatTypeName: "في الرقاب" },
  { Id: 4, ZakatTypeName: "ابن السبيل" },
  { Id: 5, ZakatTypeName: "الغارمين" },
  { Id: 6, ZakatTypeName: "في سبيل الله" },
  { Id: 7, ZakatTypeName: "المؤلفة قلوبهم" },
];

const SUBVENTION_TYPES_HARDCODED = [
  { Id: 2, SubventionTypeName: "إعانة زواج" },
  { Id: 3, SubventionTypeName: "إعانة سكن" },
  { Id: 4, SubventionTypeName: "إعانة آلة حرفة" },
  { Id: 5, SubventionTypeName: "إعانة إيجار طارئة" },
];

interface PaymentFormState {
  paymentDate: string;
  paymentValue: string;
  actionId: string;
  subventionTypeId: string;
  projectId: string;
  bankId: string;
  accountNum: string;
  usersCount: string;
  officeId: string;
  zakahName: string; // اسم نوع الزكاة أو الإعانة
}

interface Office {
  Id: number | string;
  OfficeName: string;
}

export default function AddPaymentData() {
  const toast = useToast();
  const navigate = useNavigate();
  const addPaymentMutation = useAddPaymentData();
  const { data: officesData, isLoading: officesLoading, isError: officesError } =
    useGetActiveOffices();

  const [form, setForm] = useState<PaymentFormState>({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentValue: "",
    actionId: "",
    subventionTypeId: "",
    projectId: "",
    bankId: "",
    accountNum: "",
    usersCount: "1",
    officeId: "",
    zakahName: "",
  });

  const update = (k: keyof PaymentFormState, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const isActionSelected = !!form.actionId;
  const isOfficeSelected = !!form.officeId;
  const selectedAction = ACTION_TYPES.find((a) => String(a.id) === form.actionId);
  const zakatOrSadqa = selectedAction?.code || "S";

  const officeRows: Office[] = (officesData?.rows || []) as Office[];

  const projectSubventionTypeId =
    Number(form.actionId) === 1 && form.subventionTypeId
      ? Number(form.subventionTypeId)
      : 0;

  // 🧠 نجيب المشاريع بناء على المكتب والإعانة
  const { data: projectsData, isLoading: projectsLoading } = useGetOfficeProjectsData({
    officeId: Number(form.officeId) || 0,
    subventionTypeId: projectSubventionTypeId,
    ZakatOrSadqa: zakatOrSadqa as "Z" | "S",
    startNum: 0,
    count: 999999,
  });

  // 🏦 نجيب بيانات ToBank
  const { data: officeBanks, isLoading: banksLoading } = useGetOfficeBanksData({
    officeId: Number(form.officeId) || 0,
    accountTypeId: 2,
    serviceTypeId: 0,
    paymentMethodId: 2,
    enabled: !!form.officeId,
  });

  const toBankOptions = useMemo(() => {
    return (
      officeBanks?.rows?.map((b: any) => ({
        id: b.BankId ?? b.Id,
        name: b.BankName ?? "—",
        accountNum: b.AccountNum ?? "",
      })) ?? []
    );
  }, [officeBanks]);

  useEffect(() => {
    const selectedBank = toBankOptions.find(
      (b) => String(b.id) === String(form.bankId)
    );
    if (selectedBank) update("accountNum", selectedBank.accountNum);
  }, [form.bankId, toBankOptions]);

  const onSubmit = async () => {
    if (
      !form.paymentValue ||
      !form.actionId ||
      !form.bankId ||
      !form.accountNum ||
      !form.officeId
    ) {
      toast({
        title: "البيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const payload = {
        paymentDate: form.paymentDate,
        paymentValue: Number(form.paymentValue) || 0,
        actionId: Number(form.actionId) || 0,
        subventionTypeId: Number(form.subventionTypeId) || 0,
        projectId: Number(form.projectId) || 0,
        bankId: Number(form.bankId) || 0,
        accountNum: form.accountNum,
        usersCount: Number(form.usersCount) || 1,
        zakahName: form.zakahName || "", // ✅ يروح كـ PaymentDesc
      };

      await addPaymentMutation.mutateAsync(payload as any);

      toast({
        status: "success",
        title: "تم الحفظ",
        description: "تم تسجيل المدفوعات بنجاح",
      });
    } catch (e: any) {
      toast({
        status: "error",
        title: "فشل الإضافة",
        description: e?.message || "حدث خطأ غير متوقع",
      });
    }
  };

  if (addPaymentMutation.isPending) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6} dir="rtl">
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        bg="white"
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Text fontSize="lg" fontWeight="700" mb={4}>
          إضافة مدفوعات مكتب
        </Text>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {/* العمود 1 */}
          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>نوع العملية (زكاة / صدقة)</FormLabel>
              <Select
                placeholder="اختر نوع العملية"
                value={form.actionId}
                onChange={(e) => {
                  update("actionId", e.target.value);
                  update("officeId", "");
                  update("subventionTypeId", "");
                  update("projectId", "");
                  update("zakahName", "");
                }}
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {isActionSelected && (
              <FormControl mb={4} isRequired>
                <FormLabel fontWeight="bold">اختر المكتب</FormLabel>
                {officesLoading ? (
                  <Spinner size="md" />
                ) : officesError ? (
                  <Text color="red.500">خطأ في تحميل المكاتب.</Text>
                ) : (
                  <Select
                    placeholder="اختر مكتبًا"
                    value={form.officeId}
                    onChange={(e) => update("officeId", e.target.value)}
                  >
                    {officeRows.map((office: Office) => (
                      <option key={office.Id} value={office.Id.toString()}>
                        {office.OfficeName}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>
            )}

            {/* ✅ نوع الزكاة */}
            {isActionSelected && Number(form.actionId) === 1 && (
              <FormControl mb={4}>
                <FormLabel>نوع الزكاة</FormLabel>
                <Select
                  placeholder="اختر نوع الزكاة"
                  value={form.subventionTypeId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    update("subventionTypeId", selectedId);
                    const selectedZakah = ZAKAT_TYPES_HARDCODED.find(
                      (z) => String(z.Id) === selectedId
                    );
                    if (selectedZakah)
                      update("zakahName", selectedZakah.ZakatTypeName);
                  }}
                >
                  {ZAKAT_TYPES_HARDCODED.map((type) => (
                    <option key={type.Id} value={type.Id}>
                      {type.ZakatTypeName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* ✅ نوع الإعانة */}
            {isOfficeSelected && Number(form.actionId) === 2 && (
              <FormControl mb={4}>
                <FormLabel>نوع الإعانة</FormLabel>
                <Select
                  placeholder="اختر نوع الإعانة"
                  value={form.subventionTypeId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    update("subventionTypeId", selectedId);
                    const selectedSubvention = SUBVENTION_TYPES_HARDCODED.find(
                      (s) => String(s.Id) === selectedId
                    );
                    if (selectedSubvention)
                      update("zakahName", selectedSubvention.SubventionTypeName);
                  }}
                >
                  {SUBVENTION_TYPES_HARDCODED.map((type) => (
                    <option key={type.Id} value={type.Id}>
                      {type.SubventionTypeName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* المشاريع */}
            {isOfficeSelected && (
              <FormControl mb={4}>
                <FormLabel fontWeight="bold">المشاريع الخاصة بالمكتب</FormLabel>
                {projectsLoading ? (
                  <Spinner size="md" />
                ) : (
                  <Select
                    placeholder="اختر المشروع"
                    value={form.projectId}
                    onChange={(e) => update("projectId", e.target.value)}
                  >
                    {projectsData?.rows?.length ? (
                      projectsData.rows.map((proj: any) => (
                        <option key={proj.Id} value={proj.Id.toString()}>
                          {proj.Name} — {proj.SubventionTypeName}
                        </option>
                      ))
                    ) : (
                      <option disabled>لا توجد مشاريع متاحة</option>
                    )}
                  </Select>
                )}
              </FormControl>
            )}
          </GridItem>

          {/* العمود 2 */}
          <GridItem>
            <FormControl mb={4} isRequired isDisabled={!isOfficeSelected}>
              <FormLabel>تاريخ الدفع</FormLabel>
              <Input
                type="date"
                value={form.paymentDate}
                onChange={(e) => update("paymentDate", e.target.value)}
              />
            </FormControl>

            <FormControl mb={4} isRequired isDisabled={!isOfficeSelected}>
              <FormLabel>قيمة الدفع (د.ل.)</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="القيمة"
                value={form.paymentValue}
                onChange={(e) => update("paymentValue", e.target.value)}
              />
            </FormControl>

            <FormControl mb={4} isDisabled={!isOfficeSelected}>
              <FormLabel>عدد المستفيدين</FormLabel>
              <Input
                type="number"
                min="1"
                value={form.usersCount}
                onChange={(e) => update("usersCount", e.target.value)}
              />
            </FormControl>
          </GridItem>

          {/* العمود 3 */}
          <GridItem>
            <FormControl mb={4} isDisabled={!isOfficeSelected}>
              <FormLabel>الحساب البنكي (ToBank)</FormLabel>
              {banksLoading ? (
                <Spinner size="sm" />
              ) : (
                <Select
                  placeholder="اختر الحساب البنكي"
                  value={form.bankId}
                  onChange={(e) => update("bankId", e.target.value)}
                >
                  {toBankOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.accountNum}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>
          </GridItem>
        </Grid>

        <HStack mt={6} spacing={4}>
          <SharedButton
            variant="brandGradient"
            type="submit"
            isLoading={addPaymentMutation.isPending}
            isDisabled={!isOfficeSelected}
          >
            إضافة
          </SharedButton>
          <SharedButton variant="dangerOutline" onClick={() => navigate(-1)}>
            إلغاء
          </SharedButton>
        </HStack>
      </Box>
    </Box>
  );
}
