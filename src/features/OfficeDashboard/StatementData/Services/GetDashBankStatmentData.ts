// src/features/BankStatements/Services/getDashBankStatmentData.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";
// لا نحتاج لـ getSession هنا، سيتم تمرير البيانات من الـ Hook

export interface StatementParams {
    officeId: number | string;
    accountNum: string;
    fromDate: string; // YYYY-MM-DD
    toDate: string;   // YYYY-MM-DD
}

/**
 * يجلب كشف الحساب البنكي بناءً على المكتب ورقم الحساب والنطاق الزمني.
 * ParametersValues = @OfficeId#@AccountNum#@FromDate#@ToDate#@StartNum#@Count
 */
export async function getDashBankStatmentData(
    params: StatementParams,
    startNum: number = 0, 
    count: number = 10
): Promise<NormalizedSummary> {
    
    // تأكد أن رقم الحساب ليس فارغًا
    if (!params.accountNum) {
        return { flags: { FAILURE: true }, message: "رقم الحساب مطلوب." } as NormalizedSummary;
    }
    
    const sqlStartNum = startNum + 1; // Start index for SQL (1-based)

    // بناء سلسلة القيم (6 قيم)
    const procedureValues = 
        `${params.officeId}#${params.accountNum}#${params.fromDate}#${params.toDate}#${sqlStartNum}#${count}`; 
    
    const ProcedureName = PROCEDURE_NAMES.GET_STATEMENT_DATA; 

    // 1. التنفيذ والحصول على النتيجة الخام
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // Offset
        count      // Fetch
    );
    
    // 2. التحليل والتوحيد
    return analyzeExecution(exec);
}