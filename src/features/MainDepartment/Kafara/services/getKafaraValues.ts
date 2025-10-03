// src/features/Kafara/services/getKafara.ts
import { executeProcedure, analyzeExecution, PROCEDURE_NAMES, type NormalizedSummary } from "../../../../api/apiClient";

/** جلب قيمة الكفّارة (قراءة فقط) */
export async function getKafaraValues(userId: number): Promise<NormalizedSummary> {
  // على حسب الدوكيومنت ParametersValues: @UserId
  const params = `${userId}`;
  const res = await executeProcedure(PROCEDURE_NAMES.GET_KAFARA_VALUES, params);
  return analyzeExecution(res);
}
