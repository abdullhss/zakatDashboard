import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface UpdateCityInput {
  id: number | string;
  cityName: string;
  pointId?: number | string;
}

/** Update = 1  — ColumnsNames: "Id#CityName",  ColumnsValues: "<Id>#<CityName>" */
export async function updateCity(input: UpdateCityInput): Promise<NormalizedSummary> {
  const { id, cityName, pointId = 1 } = input;

  const res = await doTransaction({
    TableName: PROCEDURE_NAMES.CITIES_TABLE_NAME,
    WantedAction: 1,
    ColumnsNames: "Id#CityName",
    ColumnsValues: `${id}#${cityName}`,
    PointId: pointId,
  });

  return analyzeExecution(res);
}
