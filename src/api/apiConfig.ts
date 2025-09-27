// src/api/apiConfig.ts (ملف جديد)

// نقطة النهاية الأساسية للـ API
export const API_BASE_URL: string = "    https://framework.md-license.com:8093/emsserver.dll/ERPDatabaseWorkFunctions";

// مفاتيح الوصول والتشفير


// أسماء الإجراءات المخزنة (مشفرة)
export const PROCEDURE_NAMES: Record<string, string> = {
    CHECK_MAIN_USER_LOGIN: "AatVcw3p5EfgNf7N40tSBY8vN7aBpsqvuSbZqL2vAeo=",
    // ⬅️ أضف هنا باقي الـ APIs المشفرة لاحقًا
};

// الـ DataToken الافتراضي
export const DEFAULT_DATA_TOKEN: string = "Zakat";