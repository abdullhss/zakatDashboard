import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

export async function fetchProjects(completeType: "N" | "C" | "S", start = 0, count = 20 , SubventionTypeId: number = 0) {
  const { officeId } = getSession();
  const office = Number(officeId ?? 0);

  // === التعديل الحاسم هنا: ضمان أن بارامتر البدء في السلسلة ليس صفراً ===
  const sqlStartNum = Math.max(1, start + 1); // يبدأ العد من 1 (أو 1+0=1)
  // =======================================================================
    
  // بناء البارامترات: @OfficeId#@CompleteType#@StartNum#@Count
  const params = `${office}#${SubventionTypeId}#${completeType}#${sqlStartNum}#${count}`; 

  const exec = await executeProcedure(
    PROCEDURE_NAMES.GetDashBoardOfficeProjectsData,
    params
  );

  const summary = analyzeExecution(exec);

  if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
    console.error("Error fetching projects:", summary.message);
    throw new Error(summary.message || "فشل غير معروف في جلب المشاريع.");
  }

  return {
    rows: summary.rows,
    total: summary.totalRows ?? 0,
    summary,
  };
}