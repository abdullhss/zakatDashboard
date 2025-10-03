// src/utils/encryption.ts

import CryptoJS from "crypto-js";

// ----------------------------------------------------
// الدوال المساعدة (Helper Functions)
// ----------------------------------------------------

/**
 * Converts a string key into an array of ASCII codes.
 * @param key The encryption key string.
 * @returns An array of number representing the ASCII codes.
 */
function AsciiConverter(key: string): number[] {
  const keyASCIIArry: number[] = [];
  for (let i = 0; i < key.length; i++) {
    const ascii = key.charCodeAt(i);
    keyASCIIArry.push(ascii);
  }
  return keyASCIIArry;
}

/**
 * Resizes an array to a specified size, truncating or padding with a default value.
 * @param arr The input array of numbers.
 * @param newSize The desired size of the array (32 for key, 16 for IV).
 * @param defaultValue The value to use for padding (typically 0).
 * @returns The resized array.
 */
export function ArrayResizer(arr: number[], newSize: number, defaultValue: number): number[] {
  let newArr: number[] = [...arr];
  if (newArr.length > newSize) {
    newArr = newArr.slice(0, newSize);
  } else {
    while (newArr.length < newSize) {
      newArr.push(defaultValue);
    }
  }
  return newArr;
}

/** يشيل أقواس مفردة من بداية/نهاية النص لو موجودة */
function stripSingleQuotes(s: string): string {
  return s.replace(/^'+|'+$/g, "");
}

/** يحوّل مصفوفة بايتات لأوبجكت WordArray بصيغة Hex */
function byteArrayToWordArrayHex(bytes: number[]) {
  const hex = bytes.map((num) => ("0" + num.toString(16)).slice(-2)).join("");
  return CryptoJS.enc.Hex.parse(hex);
}

// ----------------------------------------------------
// صنف التشفير الرئيسي (AES256Encryption Class)
// ----------------------------------------------------

// نوع القيمة المرجعة لدوال التشفير
type EncryptionResult = string | { [key: string]: string };

export class AES256Encryption {
  /**
   * Encrypts data using AES-256-CBC with a key derived from the input string.
   * @param data The data to encrypt (object or string).
   * @param key The encryption key. Defaults to VITE_AES256_ENCRYPTED_KEY.
   * @returns The encrypted string or an error object.
   */
  static encrypt(
    data: any,
    key: string = import.meta.env.VITE_AES256_ENCRYPTED_KEY as string
  ): EncryptionResult {
    try {
      if (!key) throw new Error("Key is required");

      // تنظيف الكائن من undefined (لو data كائن)
      let jsonObject = data;
      if (data !== null && typeof data === "object") {
        jsonObject = Array.isArray(data) ? [...data] : { ...data };
        for (const k in jsonObject) {
          if (jsonObject[k] === undefined) delete jsonObject[k];
        }
      }

      const plaintext =
        typeof jsonObject === "string" ? jsonObject : JSON.stringify(jsonObject);

      const asciiArr = AsciiConverter(key);
      const encKeyArr = ArrayResizer(asciiArr, 32, 0);
      const ivArr = ArrayResizer(asciiArr, 16, 0);

      const encodedKey = byteArrayToWordArrayHex(encKeyArr);
      const iv = byteArrayToWordArrayHex(ivArr);

      // CryptoJS.AES.encrypt بالـ WordArray + iv يستخدم CBC/PKCS7 افتراضيًا
      const encrypted = CryptoJS.AES.encrypt(plaintext, encodedKey, { iv });
      return encrypted.toString();
    } catch (error: any) {
      return { "Encryption failed:": error.message };
    }
  }

  /**
   * Decrypts an AES-256-CBC encrypted string.
   * @param encryptedData The encrypted string.
   * @param key The encryption key. Defaults to VITE_AES256_ENCRYPTED_KEY.
   * @returns The decrypted UTF-8 string (بدون محاولة JSON.parse هنا).
   */
  static decrypt(
    encryptedData: string,
    key: string = import.meta.env.VITE_AES256_ENCRYPTED_KEY as string
  ): string | { [key: string]: string } {
    try {
      if (!key) throw new Error("Key is required");
      if (!encryptedData) return "";

      const asciiArr = AsciiConverter(key);
      const encKeyArr = ArrayResizer(asciiArr, 32, 0);
      const ivArr = ArrayResizer(asciiArr, 16, 0);

      const encodedKey = byteArrayToWordArrayHex(encKeyArr);
      const iv = byteArrayToWordArrayHex(ivArr);

      // إزالة CR/LF قبل فك التشفير
      const cleanCipher = encryptedData.replace(/\r?\n/g, "");

      const bytes = CryptoJS.AES.decrypt(cleanCipher, encodedKey, { iv });
      let out = bytes.toString(CryptoJS.enc.Utf8);

      // تنظيف: trim + إزالة أقواس مفردة إن وُجدت
      out = stripSingleQuotes((out || "").trim());

      // ⚠️ مهم: لا نعمل JSON.parse هنا — نخلي apiClient يتعامل
      return out;
    } catch (error: any) {
      return { "Decryption failed:": error.message };
    }
  }
}
