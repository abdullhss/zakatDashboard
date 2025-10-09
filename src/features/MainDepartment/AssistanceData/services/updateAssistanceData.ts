// src/features/Assistances/Services/updateAssistanceData.ts
import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export const TABLE_ASSISTANCE = "g+a67fXnSBQre/3SDxT2uA==";

/** dd/MM/yyyy */
function formatDDMMYYYY(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  return `${day}/${month}/${year}`;
}

export interface UpdateAssistanceInput {
  id: number | string;
  isApproved: boolean;          // true = موافقة, false = رفض
  approvedDate: string | Date;  // لازم تاريخ (السيرفر بيبني عليه الفلترة)
  pointId?: number | string;
  dataToken?: string | number;
  sendNotification?: boolean;
  notificationProcedureEncrypted?: string;
  notificationParameters?: string;
}

export async function updateAssistanceData(
  input: UpdateAssistanceInput
): Promise<NormalizedSummary> {
  const {
    id,
    isApproved,
    approvedDate,
    pointId,
    dataToken,
    sendNotification,
    notificationProcedureEncrypted,
    notificationParameters,
  } = input;

  const approvedFlag = isApproved ? "1" : "0";           // bit: 1 أو 0
  const approvedDateStr = formatDDMMYYYY(approvedDate);  // دايمًا تاريخ

  const payload: any = {
    TableName: TABLE_ASSISTANCE,
    WantedAction: 1, // Update
    ColumnsNames: "Id#IsApproved#ApprovedDate",
    ColumnsValues: `${id}#${approvedFlag}#${approvedDateStr}`,
  };

  if (pointId != null) payload.PointId = pointId;
  if (dataToken != null) payload.DataToken = dataToken;
  if (sendNotification != null) payload.SendNotification = sendNotification ? "T" : "F";
  if (notificationProcedureEncrypted) payload.NotificationProcedure = notificationProcedureEncrypted;
  if (notificationParameters) payload.NotificationPranameters = notificationParameters;

  const exec = await doTransaction(payload);
  return analyzeExecution(exec);
}
