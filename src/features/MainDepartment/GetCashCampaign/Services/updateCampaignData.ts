// src/features/MainDepartment/GetCashCampaign/Services/updateCampaignData.ts
import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
} from "../../../../api/apiClient";

const TABLE_CAMPAIGN = "D/IZgGJ8YRlhRUmX4yZa/w=="; 

function formatDDMMYYYY(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) throw new Error("approvedDate is invalid.");
  const day = String(d.getDate()).padStart(2, "0");
  const mon  = String(d.getMonth() + 1).padStart(2, "0");
  const yr   = d.getFullYear();
  return `${day}/${mon}/${yr}`;
}

export interface UpdateCampaignInput {
  id: number | string;
  isApproved: boolean;          
  approvedDate: Date | string;  
  pointId: number | string;

  dataToken?: string | number;
  sendNotification?: boolean;
  notificationProcedureEncrypted?: string;
  notificationParameters?: string;
}

export async function updateCampaignData(
  input: UpdateCampaignInput
): Promise<NormalizedSummary> {
  if (input == null) throw new Error("No input provided to updateCampaignData.");
  if (input.id == null) throw new Error("id is required.");
  if (input.pointId == null) throw new Error("pointId is required.");

  const WantedAction = 1;  
  const ColumnsNames = "Id#IsApproved#ApprovedDate";

  const formattedDate   = formatDDMMYYYY(input.approvedDate);
  const isApprovedValue = input.isApproved ? "1" : "0"; // bit 1/0

  const payload: any = {
    TableName: TABLE_CAMPAIGN,
    WantedAction,
    ColumnsNames,
    ColumnsValues: `${input.id}#${isApprovedValue}#${formattedDate}`,
    PointId: input.pointId,
  };

  if (input.dataToken != null) payload.DataToken = input.dataToken;
  if (typeof input.sendNotification === "boolean") {
    payload.SendNotification = input.sendNotification ? "T" : "F";
  }
  if (input.notificationProcedureEncrypted) {
    payload.NotificationProcedure = input.notificationProcedureEncrypted;
  }
  if (input.notificationParameters) {
    // ملاحظة: لو الـ backend كتبه بهذا الاسم (باغلاط)، خليه كما هو:
    payload.NotificationPranameters = input.notificationParameters;
  }

  const txResult = await doTransaction(payload);
  return analyzeExecution(txResult);
}
