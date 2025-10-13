// src/features/Authentication/Services/authService.ts
import { executeProcedure, type ExecutionResult, PROCEDURE_NAMES } from "../../../api/apiClient";

export type Role = "M" | "O";

export interface UserData {
  UserID: number | string;
  UserName: string;
  UserRole: Role;
  Email?: string;
  PhoneNum?: string;
  Office_Id?: number;
  GroupRight_Id?: number;
  GroupRightName?: string;
}

export interface LoginResult {
  success: boolean;
  userData?: UserData;
  message?: string;
}

const norm = (x: any) => String(x ?? "").trim().toLowerCase();

function coerceNum(n: any): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

/** يحدد الدور من كل الحقول المحتملة (الأولوية: UserType -> Office_Id -> GroupRight_Id) */
function determineRole(user: any): Role | null {
  const ut = String(user?.UserType ?? "").trim().toUpperCase();
  if (ut === "M" || ut === "O") return ut as Role;

  const officeId = coerceNum(user?.Office_Id);
  if (officeId > 0) return "O";

  const gid = coerceNum(user?.GroupRight_Id);
  if (gid > 0) return "M";

  // اسم أدمن/مدير النظام بدون مكتب = إدارة
  if (norm(user?.UserName) === norm("مدير النظام") && officeId === 0) return "M";

  // لو عنده اسم مجموعة صلاحيات بدون مكتب نعتبره إدارة
  const grn = String(user?.GroupRightName ?? "").trim();
  if (grn && officeId === 0) return "M";

  return null;
}

export async function CheckMainUserLogin(userName: string, password: string): Promise<LoginResult> {
  const u = userName.trim();
  const p = password.trim();

  // طبقًا للخدمة عندكم
  const ENCRYPTED_SQL_MARKER = "$????";
  const params = `${u}#${p}#${ENCRYPTED_SQL_MARKER}`;

  const exec: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.CHECK_MAIN_USER_LOGIN,
    params
  );

  if (!exec?.success) {
    return { success: false, message: (exec as any)?.error || "تعذر الاتصال بالخادم." };
  }

  // الـ SP عندكم بيرجع Rows مباشرة (شايفها في لقطة الشاشة)
  const rows: any[] =
    (exec as any)?.data?.Result ?? (exec as any)?.rows ?? [];

  // نختار السطر المطابق لاسم المستخدم/الإيميل/الموبايل
  const isMatch = (r: any) =>
    norm(r?.UserName) === norm(u) ||
    norm(r?.Email)    === norm(u) ||
    norm(r?.PhoneNum) === norm(u) ||
    norm(r?.Phone)    === norm(u);

  const picked = (rows.find(isMatch) ?? rows[0]) ?? null;
  if (!picked) return { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة." };

  const role = determineRole(picked);
  if (!role) return { success: false, message: "تعذر تحديد الدور للمستخدم." };

  const userData: UserData = {
    UserID: picked?.UserID ?? picked?.Id ?? 0,
    UserName: String(picked?.UserName ?? ""),
    UserRole: role,
    Email: picked?.Email,
    PhoneNum: picked?.PhoneNum ?? picked?.Phone,
    Office_Id: coerceNum(picked?.Office_Id),
    GroupRight_Id: coerceNum(picked?.GroupRight_Id),
    GroupRightName: picked?.GroupRightName ?? "",
  };

  // لأغراض تتبع/دبج مؤقتًا
  (window as any).__loginDebug = { exec, rows, picked, role, userData };

  return { success: true, userData, message: "تم تسجيل الدخول بنجاح." };
}
