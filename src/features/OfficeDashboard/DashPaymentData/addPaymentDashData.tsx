// src/features/Payments/AddPaymentData.tsx

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
import { useGetOfficeProjectsData } from "./hooks/useGetProjectDashData";
import { useGetOfficeBanksData } from "../TransferBanksData/hooks/useGetOfficeBanksData";
import { getSession } from "../../../session";

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

// كل الإعانات المتاحة
const ALL_SUBVENTION_TYPES = [
  { Id: 2, SubventionTypeName: "إعانة زواج", zakatTypeId: 1 },
  { Id: 3, SubventionTypeName: "إعانة سكن", zakatTypeId: 1 },
  { Id: 4, SubventionTypeName: "إعانة آلة حرفة", zakatTypeId: 1 },
  { Id: 5, SubventionTypeName: "إعانة إيجار طارئة", zakatTypeId: 1 },
  { Id: 8, SubventionTypeName: "إعانة غارمين", zakatTypeId: 5 },
];

interface PaymentFormState {
  paymentDate: string;
  paymentValue: string;
  actionId: string;
  zakatTypeId: string;
  subventionTypeId: string;
  projectId: string;
  bankId: string;
  accountNum: string;
  usersCount: string;
  zakahName: string;
}

export default function AddPaymentData() {
  const toast = useToast();
  const navigate = useNavigate();
  const addPaymentMutation = useAddPaymentData();

  const session = getSession();
  const officeId = session?.officeId || 0;

  const [form, setForm] = useState<PaymentFormState>({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentValue: "",
    actionId: "",
    zakatTypeId: "",
    subventionTypeId: "",
    projectId: "",
    bankId: "",
    accountNum: "",
    usersCount: "1",
    zakahName: "",
  });

  const update = (k: keyof PaymentFormState, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const isActionSelected = !!form.actionId;
  const selectedAction = ACTION_TYPES.find((a) => String(a.id) === form.actionId);
  const zakatOrSadqa = selectedAction?.code || "S";

  // ✅ فلترة الإعانات حسب نوع الزكاة (مثلاً الفقراء والمساكين)
  const filteredSubventions = useMemo(() => {
    if (!form.zakatTypeId) return [];
    return ALL_SUBVENTION_TYPES.filter(
      (s) => s.zakatTypeId === Number(form.zakatTypeId)
    );
  }, [form.zakatTypeId]);

  // ✅ فلترة المشاريع حسب نوع الإعانة أو نوع الزكاة
  const filterSubventionTypeId =
    form.subventionTypeId || form.zakatTypeId
      ? Number(form.subventionTypeId || form.zakatTypeId)
      : 0;

  const { data: projectsData, isLoading: projectsLoading } =
    useGetOfficeProjectsData({
      officeId: Number(officeId) || 0,
      subventionTypeId: filterSubventionTypeId,
      ZakatOrSadqa: zakatOrSadqa as "Z" | "S",
      startNum: 0,
      count: 999999,
    });

  const query = useGetOfficeBanksData({
    officeId: Number(officeId) || 0,
    accountTypeId: 2,
    serviceTypeId: zakatOrSadqa === "Z" ? 1 : 2,
    paymentMethodId: 2,
    enabled: !!officeId,
  });
  const { data: officeBanks, isLoading: banksLoading, refetch } = query;
  useEffect(() => {
    if (officeId) {
      refetch();
    }
  }, [zakatOrSadqa]);

  const toBankOptions = useMemo(() => {
    return (
      officeBanks?.rows?.map((b: any) => ({
        id: b.Bank_Id,
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
    if (!form.paymentValue || !form.actionId || !form.bankId) {
      toast({
        title: "البيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      console.log(form);
      
      // const payload = {
      //   paymentDate: form.paymentDate,
      //   paymentValue: Number(form.paymentValue),
      //   actionId: Number(form.actionId),
      //   subventionTypeId: Number(form.subventionTypeId) || 0,
      //   projectId: Number(form.projectId) || 0,
      //   bankId: Number(form.bankId) || 0,
      //   accountNum: form.accountNum,
      //   usersCount: Number(form.usersCount) || 1,
      //   zakahName: form.zakahName,
      //   officeId: Number(officeId),
      // };

      // await addPaymentMutation.mutateAsync(payload as any);

      // toast({
      //   status: "success",
      //   title: "تم الحفظ",
      //   description: "تم تسجيل المدفوعات بنجاح",
      // });
      // navigate(-1);
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
          إضافة مدفوعات مكتبك
        </Text>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {/* العمود الأول */}
          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>نوع العملية</FormLabel>
              <Select mx={-3} px={3}
                placeholder="اختر نوع العملية"
                value={form.actionId}
                onChange={(e) => {
                  update("actionId", e.target.value);
                  update("zakatTypeId", "");
                  update("subventionTypeId", "");
                  update("projectId", "");
                }}
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* نوع الزكاة */}
            {Number(form.actionId) === 1 && (
              <>
                <FormControl mb={4}>
                  <FormLabel>نوع الزكاة</FormLabel>
                  <Select
                  mx={-3} px={3}
                    placeholder="اختر نوع الزكاة"
                    value={form.zakatTypeId}
                    onChange={(e) => {
                      update("zakatTypeId", e.target.value);
                      update("subventionTypeId", "");
                    }}
                  >
                    {ZAKAT_TYPES_HARDCODED.map((type) => (
                      <option key={type.Id} value={type.Id}>
                        {type.ZakatTypeName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* عرض الإعانات الخاصة بالفقراء والمساكين فقط */}
                {Number(form.zakatTypeId) === 1 && (
                  <FormControl mb={4}>
                    <FormLabel>نوع الإعانة</FormLabel>
                    <Select mx={-3} px={3}
                      placeholder="اختر نوع الإعانة"
                      value={form.subventionTypeId}
                      onChange={(e) => update("subventionTypeId", e.target.value)}
                    >
                      {filteredSubventions.map((type) => (
                        <option key={type.Id} value={type.Id}>
                          {type.SubventionTypeName}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}

            {/* المشاريع */}
            {isActionSelected && (
              <FormControl mb={4}>
                <FormLabel>مشاريع المكتب</FormLabel>
                {projectsLoading ? (
                  <Spinner size="md" />
                ) : (
                  <Select mx={-3} px={3}
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

          {/* العمود الثاني */}
          <GridItem>
            <FormControl mb={4}>
              <FormLabel>تاريخ الدفع</FormLabel>
              <Input
                type="date"
                value={form.paymentDate}
                onChange={(e) => update("paymentDate", e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>قيمة الدفع (د.ل)</FormLabel>
              <Input
                type="number"
                value={form.paymentValue}
                onChange={(e) => update("paymentValue", e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>عدد المستفيدين</FormLabel>
              <Input
                type="number"
                min="1"
                value={form.usersCount}
                onChange={(e) => update("usersCount", e.target.value)}
              />
            </FormControl>
          </GridItem>

          {/* العمود الثالث */}
          <GridItem>
            <FormControl mb={4}>
              <FormLabel>الحساب البنكي</FormLabel>
              {banksLoading ? (
                <Spinner size="sm" />
              ) : (
                <Select mx={-3} px={3}
                  placeholder="اختر الحساب البنكي"
                  value={form.bankId}
                  onChange={(e) => {console.log(e.target.value);
                   update("bankId", e.target.value);}}
                >
                  {toBankOptions.map((b) => { console.log(b);
                   return(
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.accountNum}
                    </option>
                  )})}
                </Select>
              )}
            </FormControl>
          </GridItem>
        </Grid>

        <HStack mt={6} spacing={4}>
          <SharedButton variant="brandGradient" type="submit">
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
