import { useCallback, useMemo, useState } from "react";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { addUser } from "../Services/addUser";

/* نجيب الـ UserId الحالي لاستخدامه كـ PointId */
function getCurrentUserId(): number {
  const stores = [localStorage, sessionStorage];
  const keys = ["mainUser", "MainUser", "user", "auth", "login", "MainUserData", "UserData"];
  for (const store of stores) {
    for (const k of keys) {
      try {
        const raw = store.getItem(k);
        if (!raw) continue;
        const obj = JSON.parse(raw);
        const id =
          obj?.UserId ?? obj?.userId ?? obj?.Id ?? obj?.id ??
          obj?.data?.UserId ?? obj?.data?.id;
        if (Number.isFinite(Number(id))) return Number(id);
      } catch {}
    }
  }ac
  return 0;
}

type AddUserPayload = {
  FullName?: string;
  UserName: string;
  Email: string;
  PhoneNum: string;
  Password: string;
  ConfirmPassword?: string;
  UserType: "M" | "O";
  GroupRight_Id?: number | string;   // إدارة فقط
  Office_Id?: number | string;       // مكتب فقط
  LoginName?: string;
};

type Options = {
  pointId?: number | string;
  dataToken?: string;
};

export function useAddUser(opts: Options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<NormalizedSummary | null>(null);

  const pointId = opts.pointId ?? getCurrentUserId();

  const submit = useCallback(
    async (p: AddUserPayload) => {
      setLoading(true);
      setError(null);
      setSummary(null);

      try {
        const userName = String(p.UserName ?? "").trim();
        const email    = String(p.Email ?? "").trim();
        const phoneNum = String(p.PhoneNum ?? "").replace(/\D/g, "");
        const password = String(p.Password ?? "");
        const confirm  = p.ConfirmPassword != null ? String(p.ConfirmPassword) : undefined;
        const userType = (p.UserType ?? "M") as "M" | "O";
        const login    = String(p.LoginName ?? userName);

        // مكتب = 0، إدارة = القيمة المختارة
        console.log(p.GroupRight_Id);
        
        const groupRightId = p.GroupRight_Id;
        // مكتب فقط؛ إدارة = 0
        const officeId     = userType === "O" ? (Number(p.Office_Id ?? 0) || 0) : 0;

        // تحققات أساسية
        if (!userName || !email || !phoneNum || !password) {
          throw new Error("من فضلك املأ الحقول الإلزامية.");
        }
        if (confirm != null && confirm !== password) {
          throw new Error("تأكيد كلمة المرور غير مطابق.");
        }
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const phoneOk = /^\d{7,20}$/.test(phoneNum);
        if (!emailOk) throw new Error("صيغة البريد الإلكتروني غير صحيحة.");
        if (!phoneOk) throw new Error("صيغة رقم الهاتف غير صحيحة.");
        // if (userType === "M" && !groupRightId) {
        //   throw new Error("من فضلك اختر الصلاحية.");
        // }
        if (userType === "O" && !officeId) {
          throw new Error("من فضلك اختر المكتب.");
        }

        // استدعاء الإضافة
        const res = await addUser(
          {
            Id: 0,
            UserName: userName,
            Email: email,
            PhoneNum: phoneNum,
            LoginName: login,
            Password: password,
            GroupRight_Id: groupRightId,  // مكتب = 0
            UserType: userType,
            Office_Id: officeId,          // إدارة = 0
          },
          { pointId, dataToken: opts.dataToken }
        );

        setSummary(res);

        // ✅ اعتبر العملية ناجحة إذا code===200 ومافيش FAILURE/INTERNAL_ERROR
        const ok = (res.code === 200) && !res.flags.FAILURE && !res.flags.INTERNAL_ERROR;
        if (!ok) {
          const msg = (res.message || "").toLowerCase();
          if (msg.includes("is repeated") || msg.includes("مكرر")) {
            throw new Error("البيانات مُكررة: اسم المستخدم أو البريد أو رقم الهاتف موجود بالفعل.");
          }
          throw new Error(res.message || "تعذّرت الإضافة.");
        }

        return res;
      } catch (e: any) {
        const msg = e?.message || "Network/Unknown error";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [opts.dataToken, pointId]
  );

  return useMemo(
    () => ({ loading, error, summary, submit }),
    [loading, error, summary, submit]
  );
}
