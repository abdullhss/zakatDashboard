import { doTransaction, PROCEDURE_NAMES, analyzeExecution, type NormalizedSummary } from "../../../../api/apiClient";

/** حذف مكتب بالـ Id (لو العلاقات تمنع الحذف، السيرفر هيرجع Error) */
export async function deleteOffice(id: number | string): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE,
    WantedAction: 2,         // Delete
    ColumnsNames: "Id",
    ColumnsValues: String(id),
    PointId: 0,              // ثابت
  });
  return analyzeExecution(result);
}

/** تعطيل مكتب (بديل آمن للحذف) — يحدّث IsActive=F */
export async function deactivateOffice(id: number | string): Promise<NormalizedSummary> {
  // ترتيب أعمدة جدول Office حسب الدوكيومنت:
  // Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName
  // في التحديث لازم تبعت ColumnsNames بالقيم اللي هتعدّلها. لو جدولك محتاج كل الأعمدة، هاتها من الـ row قبل التحديث.
  // هنا بنحدّث بس: Id و IsActive (لو السيرفر بيسمح بتحديث جزئي)
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE,
    WantedAction: 1, // Update
    ColumnsNames: "Id#IsActive",
     ColumnsValues: `${id}#0`,
    PointId: 0,
  });
  return analyzeExecution(result);
}
