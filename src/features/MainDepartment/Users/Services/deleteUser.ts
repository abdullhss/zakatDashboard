import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/** ترتيب الأعمدة المطلوب من السيرفر:
 * Id#UserName#Email#PhoneNum#LoginName#Password#GroupRight_Id#UserType#Office_Id
 */
export type DeleteUserInput = {
  Id: number | string;
  UserName: string;
  Email: string;
  PhoneNum: string;
  LoginName?: string;              // اختيارى – هنfallback لـ UserName لو مش موجود
  Password?: string;               // فاضي في الحذف
  GroupRight_Id?: number | string; // غالباً 0 للمكتب
  UserType?: "M" | "O" | string;
  Office_Id?: number | string;
  pointId?: number | string;       // اليوزر اللى بيحذف (لو عندك)
  dataToken?: string;
};

const WORK_USER_TABLE_ENC = "2D5l/tukBGtnFHHvI7YLxg==";

export async function deleteUser(input: DeleteUserInput): Promise<NormalizedSummary> {
  const Id            = input.Id ?? 0;
  const UserName      = String(input.UserName ?? "").trim();
  const Email         = String(input.Email ?? "").trim();
  const PhoneNum      = String(input.PhoneNum ?? "").trim();
  const LoginName     = String(input.LoginName ?? UserName).trim();
  const Password      = String(input.Password ?? ""); // فاضي
  const GroupRight_Id = input.GroupRight_Id ?? 0;
  const UserType      = (input.UserType ?? "").toString().trim(); // "M" | "O" | ""
  const Office_Id     = input.Office_Id ?? 0;

  // 👈 مهم: نحافظ على نفس عدد الفواصل (#) بنفس ترتيب الأعمدة حتى لو قيمة فاضية
  const columnsValues =
    `${Id}#${UserName}#${Email}#${PhoneNum}#${LoginName}#${Password}` +
    `#${GroupRight_Id}#${UserType}#${Office_Id}`;

  const columnsNames =
    "Id#UserName#Email#PhoneNum#LoginName#Password#GroupRight_Id#UserType#Office_Id";

  // WantedAction = 2 (Delete)
  const tx = await doTransaction({
    TableName: WORK_USER_TABLE_ENC,
    WantedAction: 2,
    ColumnsValues: columnsValues,
    ColumnsNames: columnsNames,
    PointId: input.pointId ?? 0,
    dataToken: input.dataToken,
  });

  return analyzeExecution(tx);
}
