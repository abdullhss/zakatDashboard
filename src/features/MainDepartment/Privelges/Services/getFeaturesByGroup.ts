// src/features/Privileges/services/getFeaturesByGroup.ts
import {
  executeProcedure,
  analyzeExecution,
  type ExecutionResult,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

/**
 * يجلب الميزات المرتبطة (أو المتاحة) لمجموعة صلاحيات محددة
 * ParametersValues = @FeatureType#@GroupRightId
 */
export async function getFeaturesByGroup(
  featureType: number | string,
  groupRightId: number | string
): Promise<NormalizedSummary> {
  const ft = String(featureType ?? "");
  const gid = String(groupRightId ?? "");
  const params = `${ft}#${gid}`;

  const result: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.GET_FEATURES_BY_GROUP,
    params
    // مبدئيًا من غير Offset/Fetch (لو حابب تزودهم لاحقًا تمام)
  );

  return analyzeExecution(result);
}
