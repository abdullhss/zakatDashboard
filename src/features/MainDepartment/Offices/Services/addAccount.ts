// src/services/bankAccounts.ts
import { doTransaction } from "../../../../api/apiClient";

// 👈 TableName من رسالتك
export const BANK_TABLE_NAME = "7OJ/SnO8HWuJK+w5pE0FXA==";

// شكل السجل في الجدول (زي الداتابيز)
export type BankAccountRow = {
  Id: string | number;
  Office_Id: string | number;
  Bank_Id: string | number;
  AccountNum: string;
  OpeningBalance: string | number;
  AccountType_Id: string | number;
  ServiceType_Id: string | number;
  AcceptBankCards: 0 | 1;
  IsActive: 0 | 1;
};

// بيانات الإدخال (من الفورم) من غير Id
export type BankAccountInput = Omit<BankAccountRow, "Id">;

// اسماء الأعمدة (اختياري – مفيد في الـ Update)
const COLUMNS_NAMES =
  "Id#Office_Id#Bank_Id#AccountNum#OpeningBalance#AccountType_Id#ServiceType_Id#AcceptBankCards#IsActive";

// حوّل input إلى ColumnsValues جاهزة
function toColumnsValues(
  data: Partial<BankAccountRow>,
  forUpdateOrDelete = false
) {
  const Id = data.Id ?? (forUpdateOrDelete ? "" : "");
  const Office_Id = data.Office_Id ?? "";
  const Bank_Id = data.Bank_Id ?? "";
  const AccountNum = data.AccountNum ?? "";
  const OpeningBalance = data.OpeningBalance ?? "";
  const AccountType_Id = data.AccountType_Id ?? "";
  const ServiceType_Id = data.ServiceType_Id ?? "";
  const AcceptBankCards =
    data.AcceptBankCards != null ? String(data.AcceptBankCards) : "";
  const IsActive = data.IsActive != null ? String(data.IsActive) : "";

  // لازم نحافظ على نفس الترتيب
  return [
    Id,
    Office_Id,
    Bank_Id,
    AccountNum,
    OpeningBalance,
    AccountType_Id,
    ServiceType_Id,
    AcceptBankCards,
    IsActive,
  ].join("#");
}

/** إنشاء حساب بنك (Insert) */
export async function createBankAccount(input: BankAccountInput) {
  const ColumnsValues = toColumnsValues(
    { ...input, Id: "" /* السيرفر يطلّع Id */ },
    false
  );

  const res = await doTransaction({
    TableName: BANK_TABLE_NAME,
    WantedAction: 0, // Insert
    ColumnsValues,
    ColumnsNames: COLUMNS_NAMES, // نديه الأسامي برضه (سلامة)
    PointId: 0,
  });

  return res;
}

/** تعديل حساب بنك (Update) — لازم Id */
export async function updateBankAccount(
  id: string | number,
  input: BankAccountInput
) {
  const ColumnsValues = toColumnsValues(
    { Id: id, ...input },
    true // update/delete
  );

  const res = await doTransaction({
    TableName: BANK_TABLE_NAME,
    WantedAction: 1, // Update
    ColumnsValues,
    ColumnsNames: COLUMNS_NAMES, // مهم جدًا في الـ Update علشان أول عمود Id
    PointId:0,
  });

  return res;
}

/** حذف حساب بنك (Delete) — يكفي Id */
export async function deleteBankAccount(id: string | number) {
  // في الحذف أغلب الأنظمة بتحتاج Id فقط، لكن هنحافظ على نفس ترتيب الأعمدة
  const ColumnsValues = toColumnsValues(
    {
      Id: id,
      Office_Id: "",
      Bank_Id: "",
      AccountNum: "",
      OpeningBalance: "",
      AccountType_Id: "",
      ServiceType_Id: "",
      AcceptBankCards: 0,
      IsActive: 0,
    },
    true
  );

  const res = await doTransaction({
    TableName: BANK_TABLE_NAME,
    WantedAction: 2, // Delete
    ColumnsValues,
    ColumnsNames: COLUMNS_NAMES,
    PointId: 0,
  });

  return res;
}
