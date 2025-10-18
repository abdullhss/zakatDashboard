// import axios, { AxiosProgressEvent } from "axios";
// import { AES256Encryption } from "../AES256Encryption.js";
// import { getBase64 } from "../../global/upload-image/UploadImage.jsx";

// /** خيارات رفع ملف لموقع عام (UploadFileWebSite) */
// export interface UploadWebsiteOptions {
//   action: string;               // Add | Update | Delete | ...
//   file?: File | null;           // Optional when action === 'Delete'
//   fileId?: string;              // existing file id (for update/delete)
//   SessionID: string;
// }

// /** خيارات رفع ملف (UploadFileEnc) */
// export interface UploadOptions {
//   action: string;               // Add | Update | Delete | ...
//   file: File;                   // required
//   fileId?: string;              // existing file id
//   SessionID: string;
//   onProgress?: (progress: number) => void;
//   controller?: AbortController;
// }

// /** نتيجة عمليات الرفع/الحذف */
// export interface UploadResult {
//   status: string;
//   id: string;
//   error: string;
// }

// /** خيارات الحذف */
// export interface DeleteOptions {
//   fileId: string;
//   SessionID: string;
// }

// /** خيارات التحميل */
// export interface DownloadOptions {
//   fileId: string;
//   SessionID: string;
// }

// /** نتيجة التحميل */
// export interface DownloadResult {
//   status: string;
//   url: string;          // data URL (base64)
//   name: string;
//   OriginalName: string;
//   FileExt: string;
//   error: string;
// }

// /** حمولة بيانات الملف المُشفرة المشتركة */
// interface EncryptedFilePayload {
//   ActionType?: string;
//   FileId?: string;
//   MainId: number;
//   SubId: number;
//   DetailId: number;
//   FileType: string;
//   Description: string;
//   Name: string;
//   DataToken: string | undefined;
//   SessionID: string;
// }

// /**
//  * كلاس للتعامل مع الرفع/الحذف/التحميل عبر السيرفر.
//  */
// export class HandelFile {
//   /**
//    * UploadFileWebSite: يرفع ملفًا لنقطة UploadFileWebSite.
//    */
//   async UploadFileWebSite({
//     action,
//     file,
//     fileId = "",
//     SessionID,
//   }: UploadWebsiteOptions): Promise<UploadResult> {
//     if (!file && action !== "Delete") {
//       console.error("No file provided");
//       return { status: "400", id: "", error: "No file provided" };
//     }

//     const convertedFile = {
//       MainId: 0,
//       SubId: 0,
//       DetailId: 0,
//       FileType: file ? `.${file.name.split(".").pop()}` : "",
//       Description: "",
//       Name: file?.name || " ",
//     };

//     const jsonData = {
//       ApiToken: process.env.REACT_APP_API_TOKEN,
//       Data: AES256Encryption.encrypt({
//         ActionType: action,
//         FileId: fileId,
//         ...convertedFile,
//         DataToken: process.env.REACT_APP_DATA_TOKEN,
//         SessionID,
//       } as EncryptedFilePayload),
//       encode_plc1: file ? (await getBase64(file)).split(",")[1] : "",
//     };

//     const { data } = await axios.post(
//       String(process.env.REACT_APP_BACKEND_MD_BASE_URL) + "UploadFileWebSite",
//       jsonData
//     );

//     return {
//       status: AES256Encryption.decrypt(data.Result),
//       id: AES256Encryption.decrypt(data.FileId),
//       error: AES256Encryption.decrypt(data.Error),
//     };
//   }

//   /**
//    * UploadFile: يرفع ملفًا لنقطة UploadFileEnc مع onProgress و AbortController.
//    */
//   async UploadFile({
//     action,
//     file,
//     fileId = "",
//     SessionID,
//     onProgress,
//     controller,
//   }: UploadOptions): Promise<UploadResult> {
//     if (!file) {
//       console.error("No file provided");
//       return { status: "400", id: "", error: "No file provided" };
//     }

//     const convertedFile = {
//       MainId: 0,
//       SubId: 0,
//       DetailId: 0,
//       FileType: `.${file.name.split(".").pop()}`,
//       Description: "",
//       Name: file.name || " ",
//     };

//     const base64File = await getBase64(file);
//     const jsonData = {
//       ApiToken: process.env.REACT_APP_API_TOKEN,
//       Data: AES256Encryption.encrypt({
//         ActionType: action,
//         FileId: fileId,
//         ...convertedFile,
//         DataToken: process.env.REACT_APP_DATA_TOKEN,
//         SessionID,
//       } as EncryptedFilePayload),
//       encode_plc1: base64File.split(",")[1],
//     };

//     const { data } = await axios.post(
//       String(process.env.REACT_APP_BACKEND_MD_BASE_URL) + "UploadFileEnc",
//       jsonData,
//       {
//         signal: controller?.signal,
//         onUploadProgress: (pe: AxiosProgressEvent) => {
//           if (onProgress && pe.total) {
//             const progress = Math.round((pe.loaded * 100) / pe.total);
//             onProgress(progress);
//           }
//         },
//       }
//     );

//     return {
//       status: AES256Encryption.decrypt(data.Result),
//       id: AES256Encryption.decrypt(data.FileId),
//       error: AES256Encryption.decrypt(data.Error),
//     };
//   }

//   /**
//    * DeleteFile: يحذف ملفًا باستخدام FileId.
//    */
//   async DeleteFile({ fileId = "", SessionID }: DeleteOptions): Promise<UploadResult> {
//     const jsonData = {
//       ApiToken: process.env.REACT_APP_API_TOKEN,
//       Data: AES256Encryption.encrypt({
//         ActionType: "Delete",
//         FileId: fileId,
//         MainId: 0,
//         SubId: 0,
//         DetailId: 0,
//         FileType: "",
//         Description: "",
//         Name: "",
//         DataToken: process.env.REACT_APP_DATA_TOKEN,
//         SessionID,
//       } as EncryptedFilePayload),
//       encode_plc1: "",
//     };

//     const { data } = await axios.post(
//       String(process.env.REACT_APP_BACKEND_MD_BASE_URL) + "UploadFileEnc",
//       jsonData
//     );

//     return {
//       status: AES256Encryption.decrypt(data.Result),
//       id: AES256Encryption.decrypt(data.FileId),
//       error: AES256Encryption.decrypt(data.Error),
//     };
//   }

//   /**
//    * DownloadFile: يقوم بتنزيل ملف (data URL base64) عبر DownloadFileEnc.
//    */
//   async DownloadFile({ fileId = "", SessionID }: DownloadOptions): Promise<DownloadResult> {
//     const jsonData = {
//       ApiToken: process.env.REACT_APP_API_TOKEN,
//       Data: AES256Encryption.encrypt({
//         FileId: fileId,
//         DataToken: process.env.REACT_APP_DATA_TOKEN,
//         SessionID,
//       }),
//     };

//     const { data } = await axios.post(
//       String(process.env.REACT_APP_BACKEND_MD_BASE_URL) + "DownloadFileEnc",
//       jsonData
//     );  

//     let fileData: string = String(data.FileData ?? "")
//       .replace(/\r\n/g, "")
//       .trim()
//       .replace(/^data/, "data:")
//       .replace(/base64/, ";base64,");

//     if (fileData.startsWith("data:image/png") || fileData.startsWith("data:image/gif")) {
//       fileData = fileData.slice(0, -1);
//     }

//     return {
//       status: AES256Encryption.decrypt(data.Result),
//       url: fileData,
//       name: AES256Encryption.decrypt(data.SavedFileName),
//       OriginalName: AES256Encryption.decrypt(data.OrgFileName),
//       FileExt: AES256Encryption.decrypt(data.FileExt),
//       error: AES256Encryption.decrypt(data.Error),
//     };
//   }
// }
