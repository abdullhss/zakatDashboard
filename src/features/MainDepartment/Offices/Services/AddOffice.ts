// src/features/MainDepartment/Offices/Services/AddOffice.ts
import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
} from "../../../../api/apiClient";
import { PROCEDURE_NAMES } from "../../../../api/apiClient";
import { HandelFile } from "../../../../HandleFile.js";

export type AddOfficePayload = {
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photoFile: File;
  sessionId: string;
  pointId?: number | string;
};

export async function addOffice(payload: AddOfficePayload): Promise<NormalizedSummary> {
  const {
    officeName,
    cityId,
    phone,
    address,
    isActive,
    latitude,
    longitude,
    photoFile,
    sessionId,
    pointId,
  } = payload;

  // 1) رفع الصورة باستخدام الفانكشن الجديدة
  const hf = new HandelFile();
  const uploadRes = await hf.UploadFileWebSite({
    action: "Insert",           // عملية رفع صورة جديدة
    file: photoFile,           // إرسال الصورة
    SessionID: sessionId,      // إرسال الـ session ID
    fileId: "",                // ID فارغ للإضافة
  });

  if (uploadRes.error) throw new Error(uploadRes.error || "فشل رفع الصورة.");

  // 2) تحميل اسم الصورة بعد رفعها
  const meta = await hf.DownloadFile({
    fileId: uploadRes.id,
    SessionID: sessionId,
  });

  if (meta.error) throw new Error(meta.error || "فشل قراءة اسم الصورة بعد الرفع.");

  const savedPhotoName = meta.name || ""; // تخزين اسم الصورة المحفوظ

  // 3) بناء الأعمدة للإدخال في الـ Database
  const ColumnsValues = [
    "0",                          // ID فارغ للإضافة
    String(officeName ?? ""),
    String(latitude ?? ""),
    String(longitude ?? ""),
    String(cityId ?? ""),
    String(phone ?? ""),
    String(address ?? ""),
    isActive ? "1" : "0",         // تحويل القيمة المنطقية إلى 1/0
    String(savedPhotoName ?? ""), // إضافة اسم الصورة
  ].join("#");

  // 4) تنفيذ عملية الإدراج في الـ Database
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE,
    WantedAction: 0,              // 0: Insert
    ColumnsValues,
    PointId: 0,
  });

  return analyzeExecution(result);  // إرجاع النتيجة المحللة
}
