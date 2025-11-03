import type { Option } from "../BankDetailsSection";

export const OFFICE_TABLE = "msDmpDYZ2wcHBSmvMDczrg==";
export const BANK_TABLE   = "7OJ/SnO8HWuJK+w5pE0FXA==";

export const BANK_COLS =
  "Id#Office_Id#Bank_Id#AccountNum#OpeningBalance#AccountType_Id#ServiceType_Id#AcceptBankCards#IsActive";

export const serviceTypes: Option[] = [
  { value: "1", label: "صدقة" },
  { value: "2", label: "زكاة"  },
];
