// src/utils/HandleFile.ts
import axios from "axios";
import { AES256Encryption } from "./encryption";

/** Read file to base64 (dataURL) */
export function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** Safe URL join */
function joinUrl(base: string, path: string) {
  const b = (base || "").trim();
  if (!b) throw new Error("VITE_BACKEND_MD_BASE_URL is missing!");
  return b.endsWith("/") ? b + path : b + "/" + path;
}

/** Normalize any value (including decrypt errors) to string */
function toText(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    // AES decrypt error shape or generic
    return v["Decryption failed:"] || v.error || JSON.stringify(v);
  }
  try { return JSON.stringify(v); } catch { return String(v); }
}

/** Read env (Vite) */
const API_TOKEN  = import.meta.env.VITE_API_TOKEN as string;
const DATA_TOKEN = import.meta.env.VITE_DATA_TOKEN as string;
const BASE_URL   = import.meta.env.VITE_BACKEND_MD_BASE_URL as string;

if (!API_TOKEN || !DATA_TOKEN || !BASE_URL) {
  console.warn("[ENV] Missing one of VITE_API_TOKEN / VITE_DATA_TOKEN / VITE_BACKEND_MD_BASE_URL");
}

type UploadAction = "Insert" | "Update" | "Delete";

export class HandelFile {
  /** Upload via UploadFileWebSite */
  async UploadFileWebSite({
    action,
    file,
    fileId = "",
    SessionID,
  }: {
    action: UploadAction;  // استخدم "Insert" / "Update" / "Delete"
    file?: File;
    fileId?: string;
    SessionID: string;
  }) {
    if (!file && action !== "Delete") {
      return { status: 400, id: "", error: "No file provided" };
    }

    const convertedFile = {
      MainId: 0,
      SubId: 0,
      DetailId: 0,
      FileType: file ? `.${file.name.split(".").pop()}` : "",
      Description: "",
      Name: file?.name || " ",
    };

    const payload = {
      ApiToken: API_TOKEN,
      Data: AES256Encryption.encrypt({
        ActionType: action,
        FileId: fileId,
        ...convertedFile,
        DataToken: DATA_TOKEN,
        SessionID,
      }),
      encode_plc1:
        action === "Delete" || !file ? "" : (await getBase64(file)).split(",")[1],
    };

    try {
      const url = joinUrl(BASE_URL, "UploadFileWebSite");
      const { data } = await axios.post(url, payload);

      return {
        status: Number(toText(AES256Encryption.decrypt(data.Result))),
        id: toText(AES256Encryption.decrypt(data.FileId)),
        error: toText(AES256Encryption.decrypt(data.Error)),
      };
    } catch (e: any) {
      return {
        status: 500,
        id: "",
        error: e?.message ? String(e.message) : "Network error",
      };
    }
  }

  /** Upload via UploadFileEnc (with progress) */
  async UploadFile({
    action,
    file,
    fileId = "",
    SessionID,
    onProgress,
    controller,
  }: {
    action: UploadAction;
    file?: File;
    fileId?: string;
    SessionID: string;
    onProgress?: (p: number) => void;
    controller?: AbortController;
  }) {
    if (!file && action !== "Delete") {
      return { status: 400, id: "", error: "No file provided" };
    }

    const convertedFile = {
      MainId: 0,
      SubId: 0,
      DetailId: 0,
      FileType: file ? `.${file.name.split(".").pop()}` : "",
      Description: "",
      Name: file?.name || " ",
    };

    const payload = {
      ApiToken: API_TOKEN,
      Data: AES256Encryption.encrypt({
        ActionType: action,
        FileId: fileId,
        ...convertedFile,
        DataToken: DATA_TOKEN,
        SessionID,
      }),
      encode_plc1:
        action === "Delete" || !file ? "" : (await getBase64(file)).split(",")[1],
    };

    try {
      const url = joinUrl(BASE_URL, "UploadFileEnc");
      const { data } = await axios.post(url, payload, {
        signal: controller?.signal,
        onUploadProgress: (evt) => {
          if (evt.total && onProgress) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      });

      return {
        status: Number(toText(AES256Encryption.decrypt(data.Result))),
        id: toText(AES256Encryption.decrypt(data.FileId)),
        error: toText(AES256Encryption.decrypt(data.Error)),
      };
    } catch (e: any) {
      return {
        status: 500,
        id: "",
        error: e?.message ? String(e.message) : "Network error",
      };
    }
  }

  /** Delete file (UploadFileEnc with ActionType=Delete) */
  async DeleteFile({
    fileId = "",
    SessionID,
  }: {
    fileId?: string;
    SessionID: string;
  }) {
    const payload = {
      ApiToken: API_TOKEN,
      Data: AES256Encryption.encrypt({
        ActionType: "Delete" as UploadAction,
        FileId: fileId,
        MainId: 0,
        SubId: 0,
        DetailId: 0,
        FileType: "",
        Description: "",
        Name: "",
        DataToken: DATA_TOKEN,
        SessionID,
      }),
      encode_plc1: "",
    };

    try {
      const url = joinUrl(BASE_URL, "UploadFileEnc");
      const { data } = await axios.post(url, payload);

      return {
        status: Number(toText(AES256Encryption.decrypt(data.Result))),
        id: toText(AES256Encryption.decrypt(data.FileId)),
        error: toText(AES256Encryption.decrypt(data.Error)),
      };
    } catch (e: any) {
      return {
        status: 500,
        id: "",
        error: e?.message ? String(e.message) : "Network error",
      };
    }
  }

  /** Download file (returns data URL + meta) */
  async DownloadFile({
    fileId = "",
    SessionID,
  }: {
    fileId?: string;
    SessionID: string;
  }) {
    const payload = {
      ApiToken: API_TOKEN,
      Data: AES256Encryption.encrypt({
        FileId: fileId,
        DataToken: DATA_TOKEN,
        SessionID,
      }),
    };

    try {
      const url = joinUrl(BASE_URL, "DownloadFileEnc");
      const { data } = await axios.post(url, payload);

      let fileData = data.FileData
        ?.replace(/\r\n/g, "")
        ?.trim()
        ?.replace(/^data/, "data:")
        ?.replace(/base64/, ";base64,");

      // بعض السيرفرات بترجع trailing '=' في صور معينة
      if (fileData?.startsWith("data:image/png") || fileData?.startsWith("data:image/gif")) {
        fileData = fileData.slice(0, -1);
      }

      return {
        status: Number(toText(AES256Encryption.decrypt(data.Result))),
        url: fileData as string,
        name: toText(AES256Encryption.decrypt(data.SavedFileName)),
        OriginalName: toText(AES256Encryption.decrypt(data.OrgFileName)),
        FileExt: toText(AES256Encryption.decrypt(data.FileExt)),
        error: toText(AES256Encryption.decrypt(data.Error)),
      };
    } catch (e: any) {
      return {
        status: 500,
        url: "",
        name: "",
        OriginalName: "",
        FileExt: "",
        error: e?.message ? String(e.message) : "Network error",
      };
    }
  }
}
