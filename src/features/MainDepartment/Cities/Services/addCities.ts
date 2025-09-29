// src/features/.../services/cityService.ts
import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface CityInput {
  cityName: string;
}

export async function addCity(
  input: CityInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.CITIES_TABLE_NAME,
    WantedAction: 0, // Insert
    ColumnsValues: `0#${input.cityName}`,
    ColumnsNames: "Id#CityName",
    PointId: pointId,
  });

  return analyzeExecution(result);
}
