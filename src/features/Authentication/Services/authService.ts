// src/services/authService.ts

import { executeProcedure } from "../../../api/apiClient";
import type { ExecutionResult } from "../../../api/apiClient";
import { PROCEDURE_NAMES } from "../../../api/apiConfig";

// ⬅️ نوع بيانات المستخدم المرتجعة من إجراء تسجيل الدخول
export interface UserData {
  UserID: number;
  UserName: string;
  UserRole: string;
}

export interface LoginResult {
  success: boolean;
  userData?: UserData;
  message?: string;
}

export const CheckMainUserLogin = async (
  userName: string,
  password: string
): Promise<LoginResult> => {
  const cleanUserName = userName.trim();
  const cleanPassword = password.trim();

  const ENCRYPTED_SQL_MARKER = "$????";

  const procedureValues = `${cleanUserName}#${cleanPassword}#${ENCRYPTED_SQL_MARKER}`;

  const exec: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.CHECK_MAIN_USER_LOGIN,
    procedureValues
  );

  // فشل نداء الإجراء نفسه
  if (!exec.success) {
    return {
      success: false,
      message: (exec as any).error || "تعذر الاتصال بالخادم.",
    };
  }

  // نجاح الإجراء: التقط أول صف
  const row =
    (exec as any).row ??
    (Array.isArray((exec as any).rows) ? (exec as any).rows[0] : null);

  if (!row) {
    return {
      success: false,
      message: "فشل تسجيل الدخول: بيانات غير صالحة.",
    };
  }

  // Mapping من أعمدة الـ ERP إلى شكل UserData المطلوب عندك
  const userData: UserData = {
    UserID: Number(row.Id ?? row.UserID ?? 0),
    UserName: String(row.UserName ?? ""),
    UserRole: String(row.UserType ?? row.UserRole ?? ""), // 'M' | 'O'
  };

  return {
    success: true,
    userData,
    message: "تم تسجيل الدخول بنجاح.",
  };
};
