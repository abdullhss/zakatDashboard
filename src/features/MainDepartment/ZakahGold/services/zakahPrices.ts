// src/features/Zakah/services/zakahPrices.service.ts
import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

/**
 * Update only Gold/Silver price in table Zakah_GOLD_VALUE
 * Required by backend when doing UPDATE:
 *  - ColumnsNames must be "Id#GoldPrice"
 *  - ColumnsValues must follow same order: "<Id>#<GoldPrice>"
 *
 * IDs (حسب كلامك):
 *  - 4  => عيار 24
 *  - 5  => الفضة
 */

type UpdatePriceArgs = {
  id: number | string;           // 4 (ذهب 24) أو 5 (فضة)
  price: number | string;        // السعر الجديد
  pointId?: number | string;     // اختياري
  dataToken?: string;            // اختياري لو عندك DBs متعددة
  sendNotification?: boolean;    // اختياري
  notificationProcedure?: string;// (Encrypted) اختياري
  notificationParameters?: string;// اختياري
};

function asNumber(v: any) {
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  throw new Error("قيمة السعر غير صالحة.");
}

function buildUpdateOnlyPricePayload({
  id,
  price,
  pointId = 0,
  dataToken,
  sendNotification,
  notificationProcedure,
  notificationParameters,
}: UpdatePriceArgs) {
  const priceNum = asNumber(price);

  return {
    TableName: PROCEDURE_NAMES.Zakah_GOLD_VALUE, // <-- من apiClient
    WantedAction: 1,                              // Update
    ColumnsNames: "Id#GoldPrice",                 // مهم
    ColumnsValues: `${id}#${priceNum}`,           // نفس ترتيب ColumnsNames
    PointId: pointId,
    ...(dataToken ? { DataToken: dataToken } : {}),
    ...(sendNotification != null
      ? { SendNotification: sendNotification ? "T" : "F" }
      : {}),
    ...(notificationProcedure ? { NotificationProcedure: notificationProcedure } : {}),
    ...(notificationParameters ? { NotificationPranameters: notificationParameters } : {}),
  };
}

/** الدالة العامة لتحديث السعر (ذهب/فضة حسب id) */
export async function updateZakahPrice(args: UpdatePriceArgs): Promise<NormalizedSummary> {
  const payload = buildUpdateOnlyPricePayload(args);
  // console.log("[Zakah] DoTransaction (plain) =>", payload);
  const res = await doTransaction(payload);
  return analyzeExecution(res);
}

/** شورتكَت: تحديث سعر عيار 24 (Id=4) */
export async function updateGold24Price(price: number | string, pointId?: number | string) {
  return updateZakahPrice({ id: 4, price, pointId });
}

/** شورتكَت: تحديث سعر الفضة (Id=5) */
export async function updateSilverPrice(price: number | string, pointId?: number | string) {
  return updateZakahPrice({ id: 5, price, pointId });
}
