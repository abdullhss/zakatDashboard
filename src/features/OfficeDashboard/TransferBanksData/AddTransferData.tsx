import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../../session";
import { useGetOfficeBanksData } from "./hooks/useGetOfficeBanksData";
import { useTransferMoney } from "./hooks/useAddTransferData";
import type { OfficeBankParams } from "./Services/getOfficeBanksData";

type BankRow = {
  id: string | number;
  name: string;
  accountNum: string;
  AccountTypeId?: number | string;
  ServiceId?: number | string;
};

export default function AddTransferData() {
  const toast = useToast();
  const navigate = useNavigate();

  const { officeId: sessionOfficeId } = getSession() ?? {};
  const officeId = sessionOfficeId ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const [transferDate, setTransferDate] = useState(today);
  const [fromBankId, setFromBankId] = useState("");
  const [fromAccountNum, setFromAccountNum] = useState("");
  const [toBankId, setToBankId] = useState("");
  const [toAccountNum, setToAccountNum] = useState("");
  const [transferValue, setTransferValue] = useState("");

  const [fromBankDetails, setFromBankDetails] = useState<BankRow | null>(null);
  const PAYMENT_METHOD_ID = 2;

  // 🏦 جلب بنوك المرسل
  const fromParams: OfficeBankParams = useMemo(
    () => ({
      officeId,
      accountTypeId: 1,
      serviceTypeId: 3,
      paymentMethodId: PAYMENT_METHOD_ID,
    }),
    [officeId]
  );

  const {
    data: fromBanksData,
    isLoading: fromLoading,
    isError: fromError,
    error: fromErr,
  } = useGetOfficeBanksData(fromParams, 0, 100, Boolean(officeId));


  const toParams: OfficeBankParams = useMemo(() => {
    if (!fromBankDetails)
      return {
        officeId,
        accountTypeId: 1,
        serviceTypeId: 3,
        paymentMethodId: PAYMENT_METHOD_ID,
      };
    return {
      officeId,
      accountTypeId: 2,
      serviceTypeId: fromBankDetails.ServiceId ?? 3,
      paymentMethodId: PAYMENT_METHOD_ID,
    };
  }, [officeId, fromBankDetails]);

  const {
    data: toBanksData,
    isLoading: toLoading,
    isError: toError,
    error: toErr,
  } = useGetOfficeBanksData(toParams, 0, 100, Boolean(officeId));

  // تحويل النتائج لقوائم
  const fromBankOptions: BankRow[] = useMemo(() => {
    return (
      fromBanksData?.rows?.map((r) => ({
        id: r.BankId ?? r.Id,
        name: r.BankName ?? r.Name ?? "—",
        accountNum: r.AccountNum ?? "",
        AccountTypeId: r.AccountTypeId,
        ServiceId: r.ServiceId,
      })) ?? []
    );
  }, [fromBanksData]);

  const toBankOptions: BankRow[] = useMemo(() => {
    return (
      toBanksData?.rows?.map((r) => ({
        id: r.BankId ?? r.Id,
        name: r.BankName ?? r.Name ?? "—",
        accountNum: r.AccountNum ?? "",
        AccountTypeId: r.AccountTypeId,
        ServiceId: r.ServiceId,
      })) ?? []
    );
  }, [toBanksData]);

  // تحديث بيانات البنك المرسل
  useEffect(() => {
    const found = fromBankOptions.find((b) => String(b.id) === String(fromBankId));
    if (found) {
      setFromAccountNum(found.accountNum ?? "");
      setFromBankDetails(found);
    } else {
      setFromAccountNum("");
      setFromBankDetails(null);
    }
  }, [fromBankId, fromBankOptions]);

  // تحديث حساب المستقبل
  useEffect(() => {
    const found = toBankOptions.find((b) => String(b.id) === String(toBankId));
    if (found) setToAccountNum(found.accountNum ?? "");
    else setToAccountNum("");
  }, [toBankId, toBankOptions]);

  // الميوتشن
  const { mutate, isPending: isTransferring } = useTransferMoney();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!officeId)
      return toast({ status: "error", title: "لا يوجد OfficeId" });

    if (!fromBankId || !toBankId)
      return toast({ status: "error", title: "اختر بنك المرسل والمستقبل" });

    if (fromBankId === toBankId)
      return toast({ status: "error", title: "لا يمكن التحويل لنفس البنك" });

    if (!transferValue || Number(transferValue) <= 0)
      return toast({ status: "error", title: "أدخل مبلغًا صحيحًا" });

    mutate(
      {
        officeId,
        transferDate,
        fromBankId,
        fromAccountNum,
        toBankId,
        toAccountNum,
        transferValue,
      },
      {
        onSuccess: (res) => {
          toast({ status: "success", title: res.message || "تمت العملية بنجاح" });
          navigate("/officedashboard/transferdata");
        },
        onError: (err) => {
          toast({ status: "error", title: "فشل التحويل", description: err.message });
        },
      }
    );
  };

  return (
    <Box p={6} dir="rtl">
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">إضافة تحويل جديد</Heading>
        <Button variant="outline" onClick={() => navigate("/officedashboard/transferdata")}>
          الرجوع للقائمة
        </Button>
      </HStack>

      {(fromLoading || toLoading) ? (
        <HStack><Spinner /><Text>جاري تحميل الحسابات البنكية…</Text></HStack>
      ) : fromError || toError ? (
        <Alert status="error"><AlertIcon />{fromErr?.message || toErr?.message}</Alert>
      ) : (
        <Box as="form" onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>تاريخ التحويل</FormLabel>
              <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>من بنك (المرسل)</FormLabel>
                <Select
                  placeholder="اختر بنك المرسل"
                  value={fromBankId}
                  onChange={(e) => setFromBankId(e.target.value)}
                >
                  {fromBankOptions.map((b) => (
                    <option key={`from-${b.id}`} value={b.id}>
                      {b.name} — {b.accountNum}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>رقم حساب المرسل</FormLabel>
                <Input value={fromAccountNum} isDisabled placeholder="رقم الحساب" />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>إلى بنك (المستقبل)</FormLabel>
                <Select
                  placeholder={fromBankDetails ? "اختر بنك المستقبل" : "اختر أولاً بنك المرسل"}
                  value={toBankId}
                  onChange={(e) => setToBankId(e.target.value)}
                  isDisabled={!fromBankDetails}
                >
                  {toBankOptions.map((b) => (
                    <option key={`to-${b.id}`} value={b.id}>
                      {b.name} — {b.accountNum}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>رقم حساب المستقبل</FormLabel>
                <Input value={toAccountNum} isDisabled placeholder="رقم الحساب" />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>قيمة التحويل</FormLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={transferValue}
                onChange={(e) => setTransferValue(e.target.value)}
              />
            </FormControl>

            <HStack>
              <Button type="submit" colorScheme="teal" isLoading={isTransferring}>
                حفظ التحويل
              </Button>
              <Button variant="ghost" onClick={() => navigate("/officedashboard/transferdata")}>
                إلغاء
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
