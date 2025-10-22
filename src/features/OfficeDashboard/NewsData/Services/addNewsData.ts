// src/features/MainDepartment/News/Services/addNewsData.ts
import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";
import { getSession } from "../../../../session";

export interface AddNewsPayload {
  newsMainTitle: string;
  newsSubTitle?: string;
  newsContents: string;

  newsMainPhotoName?: string;

  attachmentFile?: string;
  newsTypeId: number | string;
  newsPublishDate: string;
  isActive: boolean;
  pointId?: number | string;
}

// dd/MM/yyyy
function formatDateToDDMMYYYY(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// استبدال '#'
function sanitize(v: unknown): string {
  return (v ?? "").toString().replaceAll("#", "＃").trim();
}
function isNumeric(v: unknown) { return !isNaN(Number(v)); }

export async function addNewsData(payload: AddNewsPayload): Promise<NormalizedSummary> {
  const {
    newsMainTitle,
    newsSubTitle = "",
    newsContents,
    newsMainPhotoName = "", 
    attachmentFile = "",    
    newsTypeId,
    newsPublishDate,
    isActive,
    pointId,
  } = payload;

  const { userId, officeId } = getSession() ?? {};
  const workUserId = Number(userId ?? 0);
  const currentOfficeId = Number(officeId ?? 0);

  const today = formatDateToDDMMYYYY(new Date());
  const publishDateFormatted =
    /^\d{2}\/\d{2}\/\d{4}$/.test(newsPublishDate)
      ? newsPublishDate
      : formatDateToDDMMYYYY(newsPublishDate || new Date());

  const ColumnsNames =
    "Id#NewsMainTitle#NewsSubTitle#NewsContents#NewsMainPhotoName#NewsType_Id#NewsCreateDate#WorkUser_Id#NewsPublishDate#IsActive#Office_Id#AttachmentFile";

  const values = [
    String(workUserId),                 // 0 Id
    sanitize(newsMainTitle),           // 1
    sanitize(newsSubTitle),            // 2
    sanitize(newsContents),            // 3
    sanitize(newsMainPhotoName),       // 4 (ID كـ نص)
    String(Number(newsTypeId ?? 0)),   // 5
    today,                             // 6
    String(workUserId),                // 7
    publishDateFormatted,              // 8
    isActive ? "1" : "0",              // 9
    String(currentOfficeId),           // 10
    sanitize(attachmentFile),          // 11 (ID كـ نص)
  ];

  if (!isNumeric(values[0]) || !isNumeric(values[5]) || !isNumeric(values[7]) || !isNumeric(values[10])) {
    throw new Error("تحقق من القيم الرقمية (نوع الخبر/المستخدم/المكتب).");
  }

  const ColumnsValues = values.join("#");

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.NEWS_TABLE_NAME,
    WantedAction: 0,
    ColumnsNames,
    ColumnsValues,
    PointId: Number(pointId ?? 0),
  });

  return analyzeExecution(result);
}
