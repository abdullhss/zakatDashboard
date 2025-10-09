import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/** ترتيب الأعمدة المطلوب:
 * Id#UserName#Email#PhoneNum#LoginName#Password#GroupRight_Id#UserType#Office_Id
 */
export type WorkUserInput = {
  Id?: number | string;             // للإضافة: 0
  UserName: string;
  Email: string;
  PhoneNum: string;
  LoginName?: string;                // لو ما اتبعتش هنستخدم UserName
  Password: string;
  GroupRight_Id?: number | string;   // إدارة فقط، مكتب = 0
  UserType: "M" | "O";               // إدارة / مكتب
  Office_Id?: number | string;       // مكتب فقط، إدارة = 0
};

export type AddUserOptions = {
  pointId?: number | string;         // هنمرره من اليوزر الحالي
  dataToken?: string;
  sendNotification?: "T" | "F";
  notificationProcedureEnc?: string;
  notificationParameters?: string;
};

const WORK_USER_TABLE_ENC = "2D5l/tukBGtnFHHvI7YLxg==";

export async function addUser(
  input: WorkUserInput,
  opts: AddUserOptions = {}
): Promise<NormalizedSummary> {
  // تطبيع القيم
  const Id          = input.Id ?? 0;
  const UserName    = (input.UserName ?? "").trim();
  const Email       = (input.Email ?? "").trim();
  const PhoneNum    = (input.PhoneNum ?? "").trim();
  const LoginName   = (input.LoginName ?? input.UserName ?? "").trim();
  const Password    = (input.Password ?? "").trim();
  const UserType    = input.UserType;
  const GroupRight_Id = UserType === "O" ? 0 : (input.GroupRight_Id ?? 0);
  const Office_Id     = UserType === "O" ? (input.Office_Id ?? 0) : 0;

  // ✅ بنفس ترتيب الدوكيومنت
  const columnsValues =
    `${Id}#${UserName}#${Email}#${PhoneNum}#${LoginName}#${Password}` +
    `#${GroupRight_Id}#${UserType}#${Office_Id}`;

  // للمراجعة لو احتجت تشوف اللي بيتبعت
  console.debug("[addUser] ColumnsValues =>", columnsValues);

  const tx = await doTransaction({
    TableName: WORK_USER_TABLE_ENC,
    WantedAction: 0,
    ColumnsValues: columnsValues,
    PointId: opts.pointId ?? 0,
    dataToken: opts.dataToken,
    ...(opts.sendNotification ? { SendNotification: opts.sendNotification } : {}),
    ...(opts.notificationProcedureEnc ? { NotificationProcedure: opts.notificationProcedureEnc } : {}),
    ...(opts.notificationParameters ? { NotificationPranameters: opts.notificationParameters } : {}),
  });

  return analyzeExecution(tx);
}
