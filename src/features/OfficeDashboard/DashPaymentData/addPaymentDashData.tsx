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
import { number } from "zod";
import { executeProcedure } from "../../../api/apiClient";


const ZAKAT_TYPES_HARDCODED = [
  { Id: 1, ZakatTypeName: "الفقراء والمساكين" },
  { Id: 2, ZakatTypeName: "العاملين عليها" },
  { Id: 3, ZakatTypeName: "في الرقاب" },
  { Id: 4, ZakatTypeName: "ابن السبيل" },
  { Id: 5, ZakatTypeName: "الغارمين" },
  { Id: 6, ZakatTypeName: "في سبيل الله" },
  { Id: 7, ZakatTypeName: "المؤلفة قلوبهم" },
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
  const isMainDepartment = localStorage.getItem("role") == "M";
  const [officeBanks , setOfficeBanks] = useState({}) ;

  const [form, setForm] = useState<PaymentFormState>({
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentValue: "",
    actionId: "",
    zakatTypeId: "",
    subventionTypeId: "",
    projectId: "",
    bankId: "",
    accountNum: "",
    usersCount: "0",
    zakahName: "",
  });
  const [ACTION_TYPES , setACTION_TYPES] = useState([]) ;
  const [subventionTypes, setSubventionTypes] = useState([]);

  useEffect(()=>{
    const getActionTypes = async ()=>{
      const resposne = await executeProcedure("jMuz+t7lAQU3w5nJUBtwxA==" , "");
      setACTION_TYPES(
        resposne.rows.map(item => ({
          id: item.Id,
          name: item.ActionName
        }))
      );
    }
    getActionTypes() ;
  },[])

  useEffect(() => {
  const getSubventions = async () => {

    // لو لسه المختار لا زكاة ولا صدقة
    if (!form.actionId) {
      setSubventionTypes([]);
      return;
    }

    const zakatOrSadqa = Number(form.actionId) === 1 ? "z" : "s";

    const params = `${officeId}#${form.zakatTypeId || "0"}#${zakatOrSadqa}##1#6`;

    try {
      const response = await executeProcedure(
        "phjR2bFDp5o0FyA7euBbsp/Ict4BDd2zHhHDfPlrwnk=",
        params
      );

      let subventionTypesData = [];
      

      if (response.decrypted?.data.Result[0].SubventionTypes) {
        try {
          const parsed = typeof response.decrypted?.data.Result[0].SubventionTypes === "string"
            ? JSON.parse(response.decrypted?.data.Result[0].SubventionTypes)
            : response.decrypted?.data.Result[0].SubventionTypes;

          subventionTypesData = Array.isArray(parsed) ? parsed : [];
          
        } catch (error) {
          console.error("Error parsing SubventionTypes:", error);
        }
      }

      setSubventionTypes(subventionTypesData);
      
    } catch (err) {
      console.error(err);
      setSubventionTypes([]);
    }
  };

  getSubventions();
}, [form.actionId, form.zakatTypeId]);
console.log(subventionTypes);


  const update = (k: keyof PaymentFormState, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const isActionSelected = !!form.actionId;
  const selectedAction = ACTION_TYPES.find((a) => String(a.id) === form.actionId);
  const zakatOrSadqa = selectedAction?.id == 1 ? "Z" : "S";

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
  const { data, isLoading: banksLoading, refetch } = query;

  useEffect(() => {
    if (officeId) {
      refetch();
    }
  }, [zakatOrSadqa]);
  console.log(officeBanks);
  
  useEffect(() => {
    const fetchBanks = async () => {
      const response = await executeProcedure("NJ4Pn13/Fmu75bylIUDbD5FLwUl6QiMGGZ0Okh5MPas=","2");
      setOfficeBanks ( {
        totalRows : response.rows.length , 
        rows : response.rows,
      }
    )
      
    }
    if(isMainDepartment){
      fetchBanks() ;
    }
  } ,[])

  useEffect(() => {
  if (!isMainDepartment && data) {
    setOfficeBanks(data);
  }
}, [data, isMainDepartment]);


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
      
      const payload = {
        paymentDate: form.paymentDate,
        paymentValue: Number(form.paymentValue),
        actionId: Number(form.actionId),
        subventionTypeId: Number(form.subventionTypeId) || 0,
        projectId: Number(form.projectId) || 0,
        bankId: Number(form.bankId) || 0,
        accountNum: form.accountNum,
        usersCount: Number(form.usersCount) || 0,
        zakahName: form.zakahName,
        officeId: Number(officeId),
      };

      await addPaymentMutation.mutateAsync(payload as any);

      toast({
        status: "success",
        title: "تم الحفظ",
        description: "تم تسجيل المدفوعات بنجاح",
      });
      navigate(-1);
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
          إضافة مصروفات مكتبك
        </Text>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          {/* العمود الأول */}
          <GridItem>
            <FormControl mb={4} isRequired>
              <FormLabel>نوع العملية</FormLabel>
              <Select mx={-3} px={3}
                placeholder="اختر نوع العملية"
                value={isMainDepartment ? 12 : form.actionId}
                onChange={(e) => {
                  update("actionId", e.target.value);
                  update("zakatTypeId", "");
                  update("subventionTypeId", "");
                  update("projectId", "");
                }}
                disabled={isMainDepartment}
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
              </>
            )}
            {/* عرض الإعانات الخاصة بالفقراء والمساكين او الصدقة */}
            {(Number(form.zakatTypeId) === 1 || Number(form.actionId)==2) && (
              <FormControl mb={4}>
                <FormLabel>نوع الإعانة</FormLabel>
                <Select mx={-3} px={3}
                  placeholder="اختر نوع الإعانة"
                  value={form.subventionTypeId}
                  onChange={(e) => update("subventionTypeId", e.target.value)}
                >
                  {subventionTypes.map((type) => (
                    <option key={type.Id} value={type.Id}>
                      {type.SubventionTypeName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* المشاريع */}
            {(Number(form.zakatTypeId) === 1 || Number(form.actionId)==2) && (
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
              <FormLabel>تاريخ الصرف</FormLabel>
              <Input
                type="date"
                value={form.paymentDate}
                onChange={(e) => update("paymentDate", e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>قيمة الصرف(د.ل)</FormLabel>
              <Input
                type="number"
                value={form.paymentValue}
                onChange={(e) => update("paymentValue", e.target.value)}
              />
            </FormControl>

              <FormControl style={isMainDepartment ? {"display" : "none"} : {}} mb={4}>
              <FormLabel>عدد المستفيدين</FormLabel>
              <Input
                type="number"
                min="0"
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
