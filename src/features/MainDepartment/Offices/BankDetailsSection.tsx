import {
  Grid, GridItem, VStack, HStack, FormControl, FormLabel, FormErrorMessage,
  Input, Select, Text, Divider, chakra,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SwitchComp from "../../../Components/SwitchComp/Switch";
import { useMemo, forwardRef, useImperativeHandle } from "react";
import { useBanksQuery } from "../../MainDepartment/Banks/hooks/useGetBanks";
import { useGetAccountTypes } from "./hooks/useGetAccountTypes";
import { useToast } from "@chakra-ui/react";

const FIELD_HEIGHT = "65px";
const FIELD_RADIUS = "10px";
const FIELD_BORDER = "#B7B7B7";
const FIELD_BG = "white";

const FieldInput = chakra(Input, {
  baseStyle: { h: FIELD_HEIGHT, rounded: FIELD_RADIUS, w: "100%", bg: FIELD_BG, borderColor: FIELD_BORDER },
});
const FieldSelect = chakra(Select, {
  baseStyle: {
    h: FIELD_HEIGHT, rounded: FIELD_RADIUS, w: "100%", bg: FIELD_BG, borderColor: FIELD_BORDER, pe: "10",
    sx: { ".chakra-select__icon": { insetInlineEnd: "3", top: "50%", transform: "translateY(-50%)" } },
  },
});

export type Option = { value: string; label: string };

const BankSchema = z.object({
  bankId: z.string().min(1, "اختر البنك"),
  accountNumber: z.string().min(1, "رقم الحساب مطلوب"),
  openingBalance: z.string().min(1, "رصيد افتتاحي مطلوب"),
  accountTypeId: z.string().min(1, "نوع الحساب مطلوب"),
  serviceTypeId: z.string().min(1, "نوع الخدمة مطلوب"),
  hasCard: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
});

export type BankDetailsValues = z.infer<typeof BankSchema>;
export type BankDetailsHandle = { submit: () => Promise<BankDetailsValues | null> };

type Props = {
  index?: number | string;
  defaultValues?: Partial<BankDetailsValues>;
  /** اختياري كـ fallback؛ لو مبعِتّش حاجة هنا، هنجلب من الـ API */
  accountTypes?: Option[];
  serviceTypes: Option[];
  displayAccounts : any;
};

const BankDetailsSection = forwardRef<BankDetailsHandle, Props>(
  ({ index = 1, defaultValues, accountTypes: accountTypesProp, serviceTypes ,  displayAccounts }, ref) => {
    const { register, formState: { errors }, watch, trigger, getValues , reset } =
      useForm<BankDetailsValues>({
        resolver: zodResolver(BankSchema),
        defaultValues: {
          bankId: "", accountNumber: "", openingBalance: "",
          accountTypeId: "", serviceTypeId: "", hasCard: false, isEnabled: true, ...defaultValues,
        },
        mode: "onBlur",
      });
      
      const toast = useToast();
      useImperativeHandle(ref, () => ({
        submit: async () => {
          const valid = await trigger();
          if (!valid) return null;

          const values = getValues() as BankDetailsValues;

          // تحقق من التكرار
          const exists = displayAccounts.some(acc => 
            acc.bankId === values.bankId && acc.accountNumber === values.accountNumber
          );

          if (exists) {
            toast({
              title: "خطأ",
              description: "الحساب موجود بالفعل لنفس البنك",
              status: "error",
              duration: 4000,
              isClosable: true,
            });
            return null;
          }
          reset({
                bankId: "",
                accountNumber: "",
                openingBalance: "",
                accountTypeId: "",
                serviceTypeId: "",
                hasCard: false,
                isEnabled: true,
              });
          return values;
        },
      }));

    /* البنوك */
    const { data: banksData, isLoading: banksLoading, isError: banksError, error: banksErr } =
      useBanksQuery(0, 200);

    const bankOptions = useMemo(() => {
      const rows = banksData?.rows ?? [];
      return rows.map((r: any) => {
        const id = r.Id ?? r.BankId ?? r.id ?? r.bankId ?? r.Code ?? r.code;
        const name = r.BankName ?? r.Name ?? r.Bank ?? r.name ?? r.title ?? r.Title;
        if (id == null || name == null) return null;
        return { value: String(id), label: String(name) } as Option;
      }).filter(Boolean) as Option[];
    }, [banksData]);

    /* أنواع الحسابات — من الـ API */
    const { data: accTypesData, isLoading: accTypesLoading, isError: accTypesError, error: accTypesErr } =
      useGetAccountTypes(0, 200);

    const accountTypeOptions = useMemo<Option[]>(() => {
      if (accountTypesProp?.length) return accountTypesProp; // fallback لو بعت من الأب
      const rows = accTypesData?.rows ?? [];
      return rows.map((r) => ({ value: String(r.id), label: r.name }));
    }, [accTypesData?.rows, accountTypesProp]);

    const hasCard = watch("hasCard");
    const isEnabled = watch("isEnabled");

    return (
      <VStack align="stretch" spacing={4}>
        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          {/* البنك */}
          <GridItem colSpan={[12, 4]}>
            <FormControl isInvalid={!!errors.bankId}>
              <FormLabel>اسم البنك</FormLabel>
              <FieldSelect
                px={8}
                placeholder={banksLoading ? "جارٍ تحميل البنوك…" : "اختر البنك"}
                icon={<ChevronDownIcon />} iconColor="gray.500" iconSize="20px"
                disabled={banksLoading || banksError} {...register("bankId")}
              >
                {banksError && (
                  <option value="" disabled>
                    {banksErr instanceof Error ? banksErr.message : "تعذر جلب البنوك"}
                  </option>
                )}
                {!banksLoading && !banksError &&
                  bankOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                }
              </FieldSelect>
              <FormErrorMessage>{errors.bankId?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* رقم الحساب */}
          <GridItem colSpan={[12, 4]}>
            <FormControl isInvalid={!!errors.accountNumber}>
              <FormLabel>رقم الحساب</FormLabel>
              <FieldInput placeholder="برجاء كتابة رقم الحساب" {...register("accountNumber")} />
              <FormErrorMessage>{errors.accountNumber?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* رصيد افتتاحي */}
          <GridItem colSpan={[12, 4]}>
            <FormControl isInvalid={!!errors.openingBalance}>
              <FormLabel>رصيد افتتاحي</FormLabel>
              <FieldInput type="number" step="0.01" placeholder="برجاء كتابة رصيد افتتاحي" {...register("openingBalance")} />
              <FormErrorMessage>{errors.openingBalance?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* نوع الحساب — ديناميك */}
          <GridItem colSpan={[12, 4]}>
            <FormControl isInvalid={!!errors.accountTypeId}>
              <FormLabel>نوع الحساب</FormLabel>
              <FieldSelect
                px={8}
                placeholder={accTypesLoading ? "جارٍ تحميل أنواع الحساب…" : "اختر نوع الحساب"}
                icon={<ChevronDownIcon />} iconColor="gray.500" iconSize="20px"
                disabled={accTypesLoading || accTypesError}
                {...register("accountTypeId")}
              >
                {accTypesError && (
                  <option value="" disabled>
                    {accTypesErr instanceof Error ? accTypesErr.message : "تعذر جلب أنواع الحساب"}
                  </option>
                )}
                {!accTypesLoading && !accTypesError &&
                  accountTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                }
              </FieldSelect>
              <FormErrorMessage>{errors.accountTypeId?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* نوع الخدمة */}
          <GridItem colSpan={[12, 4]}>
            <FormControl isInvalid={!!errors.serviceTypeId}>
              <FormLabel>نوع الخدمة</FormLabel>
              <FieldSelect 
              px={8}
              placeholder="اختر نوع الخدمة" icon={<ChevronDownIcon />} iconColor="gray.500" iconSize="20px" {...register("serviceTypeId")}>
                {serviceTypes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FieldSelect>
              <FormErrorMessage>{errors.serviceTypeId?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          {/* سويتشات */}
          <GridItem marginTop="30px" colSpan={[12, 4]}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
              <HStack justify="space-between" h={FIELD_HEIGHT} px={3} rounded={FIELD_RADIUS} borderColor={FIELD_BORDER} bg={FIELD_BG}>
                <SwitchComp {...register("hasCard")} isChecked={hasCard} />
                <Text>بطاقة مصرفية</Text>
              </HStack>
              <HStack justify="space-between" h={FIELD_HEIGHT} px={3} rounded={FIELD_RADIUS} borderColor={FIELD_BORDER} bg={FIELD_BG}>
                <SwitchComp {...register("isEnabled")} isChecked={isEnabled} />
                <Text>تفعيل الحساب</Text>
              </HStack>
            </Grid>
          </GridItem>
        </Grid>

        <Divider my={4} />
      </VStack>
    );
  }
);

export default BankDetailsSection;
