// src/utils/auth.ts
export type AnyObj = Record<string, any> | null | undefined;

const STORAGE_KEYS = ["auth", "user", "mainUser", "MainUser", "login"]; // auth أولوية

function safeParse(raw: string | null): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // fallback: قد تكون القيمة نصًا (حتى لو سيئة)
    return raw;
  }
}

function normalizeRoleFromString(s: string | null | undefined): string | null {
  if (!s) return null;
  const v = String(s).trim();

  // تجاهُل قيم خاطئة شائعة
  if (/^(true|false|null|undefined|\{|\[|object)/i.test(v)) return null;

  // حرف واحد (M/O/A/…)
  if (/^[a-z]$/i.test(v)) return v.toUpperCase();

  // مسميات مطوّلة
  if (/^admin$/i.test(v)) return "A";
  if (/^main$/i.test(v)) return "M";
  if (/^office$/i.test(v)) return "O";

  return null;
}

function extractRoleFromObject(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;

  const candidates = [
    obj?.UserSysType,
    obj?.user?.role,
    obj?.role,
    obj?.Role,
    obj?.auth?.role,
  ].filter((x) => x != null);

  for (const c of candidates) {
    const norm = normalizeRoleFromString(
      typeof c === "string" ? c : String(c)
    );
    if (norm) return norm;
  }
  return null;
}

/** يرجّع الدور (M|O|A|…)، أو null لو غير موجود/قيمة غير صالحة */
export function getRoleFromStorage(): string | null {
  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    const parsed = safeParse(raw);

    // 1) لو نص مباشر
    if (typeof parsed === "string") {
      const norm = normalizeRoleFromString(parsed);
      if (norm) return norm;
    }

    // 2) لو كائن
    const fromObj = extractRoleFromObject(parsed);
    if (fromObj) return fromObj;
  }
  return null;
}

/** يرجّع UserId إن وُجد */
export function getUserIdFromStorage(): number | null {
  for (const key of STORAGE_KEYS) {
    const obj = safeParse(localStorage.getItem(key));
    const ids = [obj?.UserId, obj?.userId, obj?.Id, obj?.id].filter((v: any) =>
      Number.isFinite(Number(v))
    );
    if (ids.length) return Number(ids[0]);
  }
  return null;
}

/* ================== Helpers لكتابة auth بشكل موحّد ================== */

/** يكتب { role } تحت مفتاح "auth" بشكل قياسي */
export function setAuthRole(role: string): void {
  const norm = normalizeRoleFromString(role);
  if (!norm) throw new Error("Invalid role value");
  const existing = safeParse(localStorage.getItem("auth"));
  const next =
    existing && typeof existing === "object"
      ? { ...existing, role: norm }
      : { role: norm };
  localStorage.setItem("auth", JSON.stringify(next));
}

/** يضمن وجود كائن "auth" ويحقن المفاتيح التي ترسلها */
export function mergeAuth(payload: Record<string, any>): void {
  const existing = safeParse(localStorage.getItem("auth"));
  const next =
    existing && typeof existing === "object" ? { ...existing, ...payload } : { ...payload };
  localStorage.setItem("auth", JSON.stringify(next));
}
