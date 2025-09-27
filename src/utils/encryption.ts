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
  let keyASCIIArry: number[] = [];
  for (let i = 0; i < key.length; i++) {
    let char = key[i];
    let ascii = char.charCodeAt(0);
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
    // ⬅️ تصحيح بسيط للـ loop: استخدام push بدلاً من while لا داعي له هنا
    while (newSize > newArr.length) {
      newArr.push(defaultValue);
    }
  }
  // لا حاجة لـ newArr.length = newSize; طالما تم استخدام push/slice بشكل صحيح
  return newArr;
}

// ----------------------------------------------------
// صنف التشفير الرئيسي (AES256Encryption Class)
// ----------------------------------------------------

// ⬅️ تعريف نوع القيمة المرجعة لدوال التشفير وفك التشفير
type EncryptionResult = string | { [key: string]: string };

export class AES256Encryption {
  
  /**
   * Encrypts data using AES-256-CBC with a key derived from the input string.
   * @param data The data to encrypt (object or string).
   * @param key The encryption key. Defaults to VITE_AES256_ENCRYPTED_KEY.
   * @returns The encrypted string or an error object.
   */
  static encrypt(data: any, key: string = import.meta.env.VITE_AES256_ENCRYPTED_KEY as string): EncryptionResult {
    try {
      if (!key) {
        throw new Error("Key is required");
      }
      
      let JsonObject: any = data;

      // ⬅️ تصحيح بسيط للتحقق من نوع البيانات
      if (typeof data === "object" && data !== null && !Object.keys(data).length) {
          JsonObject = { ...data };
          for (const k in JsonObject) {
              if (JsonObject[k] === undefined) {
                  delete JsonObject[k];
              }
          }
      }
      
      const plaintext = typeof JsonObject === 'object' ? JSON.stringify(JsonObject) : String(JsonObject);
      const asciiArr = AsciiConverter(key);
      const encKey = ArrayResizer(asciiArr, 32, 0);
      const ivArr = ArrayResizer(asciiArr, 16, 0);
      
      // تحويل مصفوفات البايت إلى Hex.WordArray
      const encodedKey = CryptoJS.enc.Hex.parse(encKey.map((num) => ('0' + num.toString(16)).slice(-2)).join(''));
      const iv = CryptoJS.enc.Hex.parse(ivArr.map((num) => ('0' + num.toString(16)).slice(-2)).join(''));
      
      return CryptoJS.AES.encrypt(plaintext, encodedKey, { iv }).toString();
    } catch (error: any) {
      return { 'Encryption failed:': error.message };
    }
  }

  /**
   * Decrypts an AES-256-CBC encrypted string.
   * @param encryptedData The encrypted string.
   * @param key The encryption key. Defaults to VITE_AES256_ENCRYPTED_KEY.
   * @returns The decrypted object, string, or an error object.
   */
  static decrypt(encryptedData: string, key: string = import.meta.env.VITE_AES256_ENCRYPTED_KEY as string): any {
    try {
      if (!key) {
        throw new Error("Key is required");
      }
      if (!encryptedData) return ""; // معالجة حالة البيانات الفارغة

      const asciiArr = AsciiConverter(key);
      const encKey = ArrayResizer(asciiArr, 32, 0);
      const ivArr = ArrayResizer(asciiArr, 16, 0);
      
      // تحويل مصفوفات البايت إلى Hex.WordArray
      const encodedKey = CryptoJS.enc.Hex.parse(encKey.map((num) => ('0' + num.toString(16)).slice(-2)).join(''));
      const iv = CryptoJS.enc.Hex.parse(ivArr.map((num) => ('0' + num.toString(16)).slice(-2)).join(''));
      
      // فك التشفير: إزالة مسافات Carriage Returns/Line Feeds قبل فك التشفير
      const decrypted = CryptoJS.AES.decrypt(encryptedData.replaceAll("\r\n", ""), encodedKey, { iv });
      
      // تحويل الناتج إلى نص UTF8
      const decryption = decrypted.toString(CryptoJS.enc.Utf8);
      
      // محاولة تحليل الناتج كـ JSON
      try {
        const trimmedDecryption = decryption.trim();
        if (!trimmedDecryption) {
            return trimmedDecryption; // إرجاع سلسلة فارغة إذا كان الناتج فارغًا
        }
        return JSON.parse(trimmedDecryption);
      } catch (error) {
        // إذا فشل التحليل كـ JSON، يتم إرجاع النص العادي
        if (decryption.trim().length) {
            console.error("JSON parsing failed for decrypted data:", (error as Error).message);
        }
        return decryption.trim();
      }
    } catch (error: any) {
      // إرجاع خطأ في حالة فشل عملية فك التشفير بأكملها
      return { 'Decryption failed:': error.message };
    }
  }
}