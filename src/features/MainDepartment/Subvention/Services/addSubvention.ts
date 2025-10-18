import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export type AddSubventionTypeInput = {
  name: string;               
  desc?: string;               
  limit?: number | string;     
  offices?: number | string;  
  isActive?: boolean;          
  allowZakat?: boolean;       
};

export async function addSubventionType(
  input: AddSubventionTypeInput
): Promise<NormalizedSummary> {
  const {
    name,
    desc = "",
    limit = "",
    offices = "",
    isActive = true,
    allowZakat = false, 
  } = input;

  const ColumnsNames =
    "Id#SubventionTypeName#SubventionTypeDesc#SubventionTypeLimit#Offices#IsActive#AllowZakat";

  const columnsValues = [
    "0",                      
    name ?? "",
    desc ?? "",
    String(limit ?? ""),
    String(offices ?? ""),
    isActive ? "1" : "0",
    allowZakat ? "1" : "0",   
  ].join("#");

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.SUBVENTION_TYPE_TABLE_NAME,
    WantedAction: 0,        
    ColumnsValues: columnsValues,
    ColumnsNames,            
    PointId: 0,
  });

  return analyzeExecution(result);
}
