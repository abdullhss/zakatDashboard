// src/session.ts
export type Role = "M" | "O";

type RawUser = {
  Id?: number | string;
  UserId?: number | string;
  UserName?: string;
  UserType?: Role;
  Office_Id?: number | string;
  OfficeName?: string;
  GroupRight_Id?: number | string;
  GroupRightName?: string;
};

export function getSession() {
  const role = ((localStorage.getItem("role") || "M").toUpperCase() as Role);
  let mainUser: RawUser | null = null;
  try { mainUser = JSON.parse(localStorage.getItem("mainUser") || "null"); } catch {}

  const officeId  = Number(mainUser?.Office_Id ?? 0) || 0;
  const userId    = Number(mainUser?.UserId ?? mainUser?.Id ?? 0) || 0;
  const userName  = mainUser?.UserName || localStorage.getItem("username") || "";
  const officeName =
    mainUser?.OfficeName ||
    (officeId > 0 ? `Office #${officeId}` : "الإدارة الرئيسية");

  return { role, userId, userName, officeId, officeName, mainUser };
}

export const isMain   = () => getSession().role === "M";
export const isOffice = () => getSession().role === "O";

/** ضيف شرط Office_Id تلقائيًا على جملة SQL خام (قبل التشفير) */
export function scopeEncSQLToOffice(encSQLRaw?: string) {
  const { role, officeId } = getSession();
  if (role !== "O" || !officeId) return (encSQLRaw || "").trim();

  const sql = (encSQLRaw || "").trim();
  if (!sql) return `WHERE (Office_Id = ${officeId})`;

  const hasWhere = /where\s/i.test(sql);
  const hasOrder = /(order\s+by[\s\S]+)$/i.test(sql);

  if (hasWhere) {
    // أضِف AND قبل ORDER BY إن وُجد
    return sql.replace(/(order\s+by[\s\S]+)$/i, (m) => ` AND (Office_Id = ${officeId}) ${m}`)
              .replace(/\s+$/, "");
  }
  // مفيش WHERE
  return hasOrder ? sql.replace(/(order\s+by[\s\S]+)$/i, (m) => ` WHERE (Office_Id = ${officeId}) ${m}`)
                  : `${sql} WHERE (Office_Id = ${officeId})`;
}

/** لو API محتاج تبعته كقيمة، هات الـ Office_Id أو 0 */
export function getOfficeIdForPayload() {
  const { role, officeId } = getSession();
  return role === "O" ? officeId : 0;
}
