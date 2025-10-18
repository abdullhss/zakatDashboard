// src/features/MainDepartment/Offices/Services/updateOffice.ts

import { doTransaction, analyzeExecution, type NormalizedSummary } from "../../../../api/apiClient";

// === الترتيب المطلوب في ColumnsNames (9 أعمدة) ===
const COLS_NAMES = "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName";

// يجب أن تكون هذه الواجهة مطابقة لـ Payload الإضافة/التعديل
export type UpdateOfficePayload = {
  id: number | string;            // 1. مفتاح التعديل
  officeName: string;             
  cityId: string | number;        
  phone: string;                 
  address: string;                
  isActive: boolean | 0 | 1;      
  latitude?: string | number | null; 
  longitude?: string | number | null; 
  photoName?: string | null;       
  pointId?: number | string;         
  dataToken?: string | number;       
};

// دالة تنظيف البيانات (مُضمَّنة للحماية من علامات الـ #)
const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

/**
 * تنفذ عملية تعديل سجل المكتب باستخدام DoTransaction (WantedAction: 1).
 */
export async function updateOffice(payload: UpdateOfficePayload): Promise<NormalizedSummary> {
  const {
    id, officeName, cityId, phone, address, isActive,
    latitude, longitude, photoName, pointId = 0, dataToken,
  } = payload;

  const bit = typeof isActive === "boolean" ? (isActive ? 1 : 0) : (Number(isActive) ? 1 : 0);
  
  // === بناء سلسلة القيم (ColumnsValues) بنفس ترتيب COLS_NAMES ===
  const ColumnsValues = [
    String(id),                         // 1. Id (مفتاح التعديل)
    scrub(officeName),                  // 2. OfficeName
    scrub(latitude ?? ""),              // 3. OfficeLatitude
    scrub(longitude ?? ""),             // 4. OfficeLongitude
    String(cityId ?? ""),              // 5. City_Id
    scrub(phone),                      // 6. PhoneNum
    scrub(address),                    // 7. Address
    String(bit),                       // 8. IsActive (1/0)
    scrub(photoName ?? ""),             // 9. OfficePhotoName
  ].join("#");
  
  const tx = await doTransaction({
    TableName:   PROCEDURE_NAMES.OFFICE, 
    WantedAction: 1,          // 1 لـ Update
    ColumnsNames: COLS_NAMES, // ✅ إرسال أسماء الأعمدة لضمان الترتيب
    ColumnsValues,
    PointId: pointId, 
    dataToken,
  });

  return analyzeExecution(tx);
}