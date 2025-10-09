import { doTransaction, analyzeExecution, type NormalizedSummary } from "../../../../api/apiClient";

function toNonNull(v: any) {
  if (v === undefined || v === null) return "";
  return v;
}

export type UpdateUserInput = {
  Id: number;
  UserName: string;
  Email: string;
  PhoneNum: string;
  LoginName?: string;     // لو مش مبعوتة هنمرر UserName
  Password?: string;      // في التحديث: فاضية = لا تغيير
  GroupRight_Id: number;  // لو UserType = "O" خليه 0
  UserType: "M" | "O";
  Office_Id: number;      // لو UserType = "M" خليه 0

  // اختياري:
  dataToken?: string | number;  // مثال: "Zakat"
  pointId?: number | string;    // مثال: 0
  sendNotification?: boolean;
  notificationProcedureEncrypted?: string;
  notificationParameters?: string;
};

export async function updateUser(input: UpdateUserInput): Promise<NormalizedSummary> {
  const {
    Id,
    UserName,
    Email,
    PhoneNum,
    LoginName,
    Password,
    GroupRight_Id,
    UserType,
    Office_Id,
    dataToken,
    pointId,
    sendNotification,
    notificationProcedureEncrypted,
    notificationParameters,
  } = input;

  // ترتيب الأعمدة لازم يطابق الدوكيومنت
  const ColumnsNames =
    "Id#UserName#Email#PhoneNum#LoginName#Password#GroupRight_Id#UserType#Office_Id";

  const ColumnsValues = [
    toNonNull(Id),
    toNonNull(UserName),
    toNonNull(Email),
    toNonNull(PhoneNum),
    toNonNull(LoginName ?? UserName),
    toNonNull(Password ?? ""),           // فاضية = لا تغيير
    toNonNull(GroupRight_Id),
    toNonNull(UserType),
    toNonNull(Office_Id),
  ].join("#");

  const payload: any = {
    TableName: "2D5l/tukBGtnFHHvI7YLxg==", // WorkUser (حسب الدوكيومنت)
    WantedAction: 1,                        // Update
    ColumnsNames,
    ColumnsValues,
    PointId: pointId ?? 0,                  // ✅ رقم، مش سترينج
  };

  if (dataToken != null) payload.DataToken = dataToken; // مثال: "Zakat"
  if (typeof sendNotification === "boolean") {
    payload.SendNotification = sendNotification ? "T" : "F";
  }
  if (notificationProcedureEncrypted) {
    payload.NotificationProcedure = notificationProcedureEncrypted;
  }
  if (notificationParameters) {
    payload.NotificationPranameters = notificationParameters;
  }

  const tx = await doTransaction(payload);
  return analyzeExecution(tx);
}
