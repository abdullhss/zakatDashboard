// TableTypes.ts (الكود كامل ومحدث)

import React from 'react';

export type AnyRec = Record<string, any>;

// نوع تعريف العمود


// نوع خصائص (Props) مُكوّن الجدول
export interface DataTableProps {
  title: string;
  data: AnyRec[];
  headerAction?: React.ReactNode; 
  startIndex?: number; 

  // === خصائص الترقيم المضافة لإنهاء الخطأ ===
  page: number;
  onPageChange: (page: number) => void;
  totalRows: number;
  pageSize: number;
  // ==========================================
}


export default function TableTypes() {
 
}