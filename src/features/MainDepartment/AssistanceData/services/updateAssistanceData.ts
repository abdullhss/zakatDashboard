import { doTransaction, analyzeExecution, type NormalizedSummary } from "../../../../api/apiClient";

export const TABLE_ASSISTANCE = "g+a67fXnSBQre/3SDxT2uA=="; // كما في الـ docs

/** dd/MM/yyyy كما تستعمله باقي الموديولات */
function formatDDMMYYYY(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  return `${day}/${month}/${year}`;
}

export interface UpdateAssistanceInput {
  id: number | string;
  isApproved: boolean;              // true موافقة | false رفض
  approvedDate: string | Date;      // إلزامي

  // وفق الدوكيومنتيشن: اسم عمود الملف هو ResreachFileName
  attachmentId?: string | number;   // رقم الملف من HandelFile.UploadFileWebSite

  // خيارات إضافية من الـ API
  pointId?: number | string;
  dataToken?: string | number;
  sendNotification?: boolean;                   // "T" أو "F"
  notificationProcedureEncrypted?: string;      // اسم الإجراء مُشفّر
  notificationParameters?: string;              // القيم (انتبه لاسم المفتاح أدناه)
}

export async function updateAssistanceData(input: UpdateAssistanceInput): Promise<NormalizedSummary> {
  const {
    id,
    isApproved,
    approvedDate,
    attachmentId,
    pointId,
    dataToken,
    sendNotification,
    notificationProcedureEncrypted,
    notificationParameters,
  } = input;

  const approvedFlag = isApproved ? "1" : "0";
  const approvedDateStr = formatDDMMYYYY(approvedDate);

  // حسب الدوكيومنتيشن: في التحديث يكفي إرسال أسماء الأعمدة المراد تعديلها
  // أول عمود يجب أن يكون الـ Id
  const columns: string[] = ["Id", "IsApproved", "ApprovedDate"];
  const values: string[]  = [String(id), approvedFlag, approvedDateStr];

  // إضافة اسم الملف لو متوفر
  if (attachmentId != null && String(attachmentId).trim() !== "") {
    columns.push("ResreachFileName");
    values.push(String(attachmentId));
  }

  const payload: any = {
    TableName: TABLE_ASSISTANCE,
    WantedAction: 1, // Update
    ColumnsNames: columns.join("#"),
    ColumnsValues: values.join("#"),
  };

  if (pointId != null) payload.PointId = pointId;
  if (dataToken != null) payload.DataToken = dataToken;
  if (sendNotification != null) payload.SendNotification = sendNotification ? "T" : "F";
  if (notificationProcedureEncrypted) payload.NotificationProcedure = notificationProcedureEncrypted;

  // ⚠️ حسب الدوكيومنتيشن المفتاح اسمه NotificationPranameters (بالغلط الإملائي)
  if (notificationParameters) payload.NotificationPranameters = notificationParameters;

  const exec = await doTransaction(payload);
  return analyzeExecution(exec);
}
