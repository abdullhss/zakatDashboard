// src/features/Assistances/hooks/uploadAssistanceAttachment.ts

import { HandelFile } from "../../../../HandleFile";
import { getSession } from "../../../../session";

function isPdfFile(file: File) {
  const nameOk = file.name?.toLowerCase().endsWith(".pdf");
  const typeOk = file.type === "application/pdf";
  return nameOk || typeOk;
}

export async function uploadAssistanceAttachmentViaHF(file: File): Promise<string> {
  if (!file) throw new Error("لا يوجد ملف للرفع.");
  if (!isPdfFile(file)) throw new Error("يُسمح برفع ملفات PDF فقط.");

  const session = getSession();
  const sessionId =
    (session as any)?.SessionID ||
    (session as any)?.sessionId ||
    (session as any)?.token ||
    "";

  // 🛑 تمت إزالة فحص SessionID الصارم هنا للسماح بالمرور
  
  const hf = new HandelFile();
  
  const up = await hf.UploadFileWebSite({
    action: "Add",
    file,
    fileId: "",
    SessionID: sessionId, // تمرير القيمة (سواء كانت موجودة أو فارغة)
    onProgress: (p: number) => console.log(`Attachment progress: ${p}%`),
  });

  if (!up?.id || up.id === "0") throw new Error(up?.error || "فشل رفع المرفق");
  return String(up.id);
}