// src/features/auth/hooks/useLogin.ts (ملف جديد)

import { useMutation } from "@tanstack/react-query";
import { 
    CheckMainUserLogin, 

} from "../../../features/Authentication/Services/authService"; 
import type { LoginResult } from "../../../features/Authentication/Services/authService";


// ⬅️ تحديد مفتاح الاستعلام (Query Key) الخاص بالـ Mutation
// يُستخدم هذا المفتاح في أدوات المطور (Devtools)
const QUERY_KEY = ["login"]; 

/**
 * خطاف مخصص لإجراء عملية تسجيل الدخول (Mutation).
 * يستخدم الدالة النظيفة CheckMainUserLogin من طبقة الخدمة.
 */
export const useLogin = () => {
    // 1. استخدام useMutation
    return useMutation<
        LoginResult,                        // ⬅️ نوع بيانات النجاح المرتجعة (Success Data)
        Error,                              // ⬅️ نوع الخطأ المرتجع
        [string, string]                    // ⬅️ نوع المتغيرات المطلوبة في دالة mutate (username, password)
    >({
        // 2. دالة الـ Mutation الفعلية (Mutation Function)
        mutationFn: async ([username, password]: [string, string]) => {
            
            const result = await CheckMainUserLogin(username, password);
            
            // تحقق من النتيجة وإلقاء خطأ إذا فشلت العملية
            if (!result.success) {
                // React Query يتوقع إلقاء خطأ عادي عند فشل العملية
                throw new Error(result.message || "فشل غير معروف في تسجيل الدخول.");
            }
            
            return result;
        },
        
        // 3. مفتاح الـ Mutation (اختياري ولكنه مفيد)
        mutationKey: QUERY_KEY,

        onSuccess: (data) => {
            // يمكنك هنا حفظ التوكن في الـ Local Storage أو توجيه المستخدم
            console.log("Login successful:", data.userData);
        },
        // onError: (error) => {
        //     console.error("Login Error:", error.message);
        // }
    });
};