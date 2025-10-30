import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

const COLS =
  "Id#NewsMainTitle#NewsSubTitle#NewsContents#NewsMainPhotoName#NewsType_Id#NewsCreateDate#WorkUser_Id#NewsPublishDate#IsActive#Office_Id#AttachmentFile";

// دالة لتحويل التاريخ إلى تنسيق "dd/MM/yyyy"
function formatDateToDDMMYYYY(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export interface UpdateNewsPayload {
  id: number | string;
  newsMainTitle: string;
  newsSubTitle?: string;
  newsContents: string;
  newsMainPhotoName?: string;
  attachmentFile?: string;
  newsTypeId: number | string;
  newsCreateDate?: string;
  newsPublishDate: string;
  isActive: boolean | 0 | 1;
  pointId?: number | string;
}

export async function updateNewsData(payload: UpdateNewsPayload) {
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

  const { userId = 0, officeId = 0 } = getSession();
  const today = new Date().toISOString().slice(0, 10);
  const bit = typeof isActive === "boolean" ? (isActive ? 1 : 0) : (Number(isActive) ? 1 : 0);

  const formattedCreateDate = newsCreateDate ? formatDateToDDMMYYYY(newsCreateDate) : formatDateToDDMMYYYY(today);
  const formattedPublishDate = formatDateToDDMMYYYY(newsPublishDate);

  const ColumnsValues = [
    String(id),
    String(newsMainTitle ?? ""),
    String(newsSubTitle ?? ""),
    String(newsContents ?? ""),
    String(newsMainPhotoName ?? ""),
    String(newsTypeId ?? ""),
    String(formattedCreateDate),
    String(userId),
    String(formattedPublishDate),
    String(bit),
    String(officeId),
    String(attachmentFile ?? ""),
  ].join("#");

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.NEWS_TABLE_NAME,
    WantedAction: 1, // Update
    ColumnsNames: COLS,
    ColumnsValues,
    PointId: pointId,
  });

  return analyzeExecution(result);
}
