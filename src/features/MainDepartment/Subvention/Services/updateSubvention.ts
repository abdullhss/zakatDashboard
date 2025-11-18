import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/**
 * ميوتشن واحدة لتحديث أي مزيج من:
 * - SubventionTypeName (name)
 * - IsActive (isActive)
 * - AllowZakat (allowZakat)
 */
export type UpdateSubventionPayload = {
  id: number | string;
  name?: string;        // SubventionTypeName
  isActive?: boolean;   // IsActive
  allowZakat?: boolean; // AllowZakat
  pointId?: number | string;
  SadkaType:string
};

export async function updateSubvention(
  payload: UpdateSubventionPayload
): Promise<NormalizedSummary> {
  const { id, name, isActive, allowZakat, pointId = 0 , SadkaType} = payload;

  if (id == null) {
    throw new Error("Missing id");
  }

  const colNames: string[] = ["Id"];
  const colValues: string[] = [String(id)];

  if (typeof name !== "undefined") {
    colNames.push("SubventionTypeName");
    colValues.push(String(name ?? ""));
  }

  if (typeof isActive !== "undefined") {
    colNames.push("IsActive");
    colValues.push(isActive ? "1" : "0");
  }

  if (typeof allowZakat !== "undefined") {
    colNames.push("AllowZakat");
    colValues.push(allowZakat ? "1" : "0");
  }
  if (typeof SadkaType !== "undefined") {
    colNames.push("SadkaType");
    colValues.push(SadkaType);
  }

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.SUBVENTION_TYPE_TABLE_NAME,
    WantedAction: 1, // Update
    ColumnsNames: colNames.join("#"),
    ColumnsValues: colValues.join("#"),
    PointId: pointId,
  });

  return analyzeExecution(result);
}
