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
export const CheckMainUserLogin = async (userName: string, password: string): Promise<LoginResult> => {
   const cleanUserName = userName.trim();
    const cleanPassword = password.trim();

    const ENCRYPTED_SQL_MARKER = "$????"; 

const procedureValues =
  `${cleanUserName}#${cleanPassword}#${ENCRYPTED_SQL_MARKER}`;
    const result: ExecutionResult = await executeProcedure(
        PROCEDURE_NAMES.CHECK_MAIN_USER_LOGIN,
        procedureValues
)

    if (result.success && result.data) {
        return {
            success: true,

            userData: result.data as UserData
        };
    } else {
        return {
            success: false,
            message: result.error || "فشل تسجيل الدخول: بيانات غير صالحة."
        };
    }
};