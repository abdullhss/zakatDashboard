import axios from "axios";
import { AES256Encryption } from "./utils/encryption";
// import { getBase64 } from "./UploadImage.jsx";
import { getConfig } from "./features/MainDepartment/Offices/helpers/utils.js";
export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const getRuntimeConfig = () => {
  const urls = getConfig();
  if (!urls?.url) {
    throw new Error("Config not loaded: missing url");
  }
  return {
    API_TOKEN: "TTRgG@i$$ol@m$Wegh77",
    DATA_TOKEN: urls.token,
    BASE_URL: `${urls.url}/`,
  };
};

export class HandelFile {
  async UploadFileWebSite({ action, file, fileId = "", SessionID, onProgress, controller }) {
    const urls = getConfig();
    const CONFIG = getRuntimeConfig();
    
    if (!file && action !== "Delete") return console.error("No file provided");

   const convertedFile = {
      MainId:0,
      SubId:0,
      DetailId:0,
      FileType:`.${file?.name.split('.').pop()}`,
      Description:"",
      Name:file?.name||" "
    }
    
    let jsonData = {
      ApiToken: "TTRgG@i$$ol@m$Wegh77",
      Data: AES256Encryption.encrypt({
        ActionType: action,
        FileId: fileId,
        ...convertedFile,
        DataToken: urls.token,
        SessionID,
      },"SL@C$@rd2023$$AlMedad$Soft$2022$"),
      encode_plc1: file?((await getBase64(file))?.split(',')[1]):"",
    };
    console.log(jsonData)
    
    let { data } = await axios.post(
      
    CONFIG.BASE_URL + "UploadFileWebSite", 
      jsonData,
      {
        signal: controller?.signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    
    console.log(AES256Encryption.decrypt(data.FileId,"SL@C$@rd2023$$AlMedad$Soft$2022$"))
    return {
      status: AES256Encryption.decrypt(data.Result,"SL@C$@rd2023$$AlMedad$Soft$2022$",),
      id: AES256Encryption.decrypt(data.FileId,"SL@C$@rd2023$$AlMedad$Soft$2022$",),
      error: AES256Encryption.decrypt(data.Error,"SL@C$@rd2023$$AlMedad$Soft$2022$",),
    };
  }
  

  async UploadFile({ action, file, fileId = "", SessionID, onProgress, controller }) {
    if (!file) return console.error("No file provided");

    const convertedFile = {
      MainId: 0,
      SubId: 0,
      DetailId: 0,
      FileType: `.${file?.name.split(".").pop()}`,
      Description: "",
      Name: file?.name || " ",
    };
    const base64File = await getBase64(file);

    const jsonData = {
      ApiToken: CONFIG.API_TOKEN,
      Data: AES256Encryption.encrypt({
        ActionType: action,
        FileId: fileId,
        ...convertedFile,
        DataToken: CONFIG.DATA_TOKEN,
        SessionID,
      }),
      encode_plc1: base64File.split(",")[1],
    };

    const { data } = await axios.post(
      CONFIG.BASE_URL + "UploadFileEnc",
      jsonData,
      {
        signal: controller?.signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return {
      status: AES256Encryption.decrypt(data.Result),
      id: AES256Encryption.decrypt(data.FileId),
      error: AES256Encryption.decrypt(data.Error),
    };
  }

  async DeleteFile({ fileId = "", SessionID, controller }) {
    let jsonData = {
      ApiToken: CONFIG.API_TOKEN,
      Data: AES256Encryption.encrypt({
        ActionType: "Delete",
        FileId: fileId,
        MainId: 0,
        SubId: 0,
        DetailId: 0,
        FileType: "",
        Description: "",
        Name: "",
        DataToken: CONFIG.DATA_TOKEN,
        SessionID,
      }),
      encode_plc1: "",
    };

    let { data } = await axios.post(
      CONFIG.BASE_URL + "UploadFileEnc", 
      jsonData,
      {
        signal: controller?.signal,
      }
    );
    return {
      status: AES256Encryption.decrypt(data.Result),
      id: AES256Encryption.decrypt(data.FileId),
      error: AES256Encryption.decrypt(data.Error),
    };
  }

  async DownloadFile({ fileId = "", SessionID, onProgress, controller }) {
    let jsonData = {
      ApiToken: CONFIG.API_TOKEN,
      Data: AES256Encryption.encrypt({
        FileId: fileId,
        DataToken: CONFIG.DATA_TOKEN,
        SessionID,
      }),
    };

    let { data } = await axios.post(
      CONFIG.BASE_URL + "DownloadFileEnc", 
      jsonData,
      {
        signal: controller?.signal,
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    
    let fileData = data.FileData?.replace(/\r\n/g, "")
      ?.trim()
      ?.replace(/^data/, "data:")
      ?.replace(/base64/, ";base64,");

    if (fileData.startsWith("data:image/png") || fileData.startsWith("data:image/gif")) {
      fileData = fileData.slice(0, -1);
    }

    return {
      status: AES256Encryption.decrypt(data.Result),
      url: fileData,
      name: AES256Encryption.decrypt(data.SavedFileName),
      OriginalName: AES256Encryption.decrypt(data.OrgFileName),
      FileExt: AES256Encryption.decrypt(data.FileExt),
      error: AES256Encryption.decrypt(data.Error),
    };
  }
}