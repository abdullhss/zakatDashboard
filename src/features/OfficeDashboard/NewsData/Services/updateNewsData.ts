import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";
import { getSession } from "../../../../session";

// ترتيب الأعمدة في الجدول (ثابت)
const COLS =
  "Id#NewsMainTitle#NewsSubTitle#NewsContents#NewsMainPhotoName#NewsType_Id#NewsCreateDate#WorkUser_Id#NewsPublishDate#IsActive#Office_Id#AttachmentFile";

export interface UpdateNewsPayload {
  id: number | string;

  newsMainTitle: string;
  newsSubTitle?: string;
  newsContents: string;

  // هنخزّن فيها ال-ID للصورة (نفس المشاريع)
  newsMainPhotoName?: string;

  // هنخزّن فيها ال-ID للمرفق (اختياري)
  attachmentFile?: string;

  newsTypeId: number | string;

  newsCreateDate?: string;   // لو مش موجود هنستخدم تاريخ اليوم (مع المحافظة على القديم لو مرسَل)
  newsPublishDate: string;

  isActive: boolean | 0 | 1;

  pointId?: number | string;
}

export async function updateNewsData(payload: UpdateNewsPayload): Promise<NormalizedSummary> {
  const {
    id,
    newsMainTitle,
    newsSubTitle = "",
    newsContents,
    newsMainPhotoName = "",
    attachmentFile = "",
    newsTypeId,
    newsCreateDate,
    newsPublishDate,
    isActive,
    pointId = 0,
  } = payload;

  const { userId = 0, officeId = 0 } = getSession() ?? ({} as any);
  const today = new Date().toISOString().slice(0, 10);
  const bit = typeof isActive === "boolean" ? (isActive ? 1 : 0) : (Number(isActive) ? 1 : 0);

  // نفس الترتيب بالحرف
  const ColumnsValues = [
    String(id),                       // Id
    String(newsMainTitle ?? ""),
    String(newsSubTitle ?? ""),
    String(newsContents ?? ""),
    String(newsMainPhotoName ?? ""),  // ← هنا بنحط ID الصورة
    String(newsTypeId ?? ""),
    String(newsCreateDate || today),  // إنشاء (إن لم يُرسل)
    String(userId),                   // WorkUser_Id
    String(newsPublishDate || today), // نشر
    String(bit),                      // IsActive 1/0
    String(officeId),                 // Office_Id
    String(attachmentFile ?? ""),     // ← هنا بنحط ID المرفق (لو فيه)
  ].join("#");

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.NEWS_TABLE_NAME,
    WantedAction: 1,                // Update
    ColumnsNames: COLS,
    ColumnsValues,
    PointId: pointId,
  });

  return analyzeExecution(result);
}
