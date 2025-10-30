import {
  executeProcedure,
  PROCEDURE_NAMES,
  analyzeExecution,
} from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * جلب صلاحيات الميزات (Features) لمجموعة محددة.
 * @param featureType كود الدور (M، O، إلخ).
 * @param groupRightId معرف المجموعة المطلوب جلب صلاحياتها.
 * @returns وعد (Promise) يحتوي على ملخص الاستجابة.
 */
export async function getGroupRightFeaturesData(
  featureType: string,  // إما "M" أو "O" أو "A"
  groupRightId: number
): Promise<NormalizedSummary> {
  // التأكد من أن featureType و groupRightId ليسا فارغين
  if (!featureType || groupRightId <= 0) {
    throw new Error("يجب أن تكون القيم featureType و groupRightId صحيحة.");
  }

  // تمرير المعاملات في الشكل الصحيح
  const procedureValues = `${featureType}#${groupRightId}`;
  
  const ProcedureName = PROCEDURE_NAMES.GET_GROUP_RIGHT_FEATURES_DATA;

  // تنفيذ الاستعلام
  const result: ExecutionResult = await executeProcedure(
    ProcedureName,
    procedureValues
  );

  // تحليل الاستجابة
  return analyzeExecution(result);
}
