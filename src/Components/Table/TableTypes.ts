// TableTypes.ts (الكود كامل ومحدث)

import React from 'react';

export type AnyRec = Record<string, any>;

// نوع تعريف العمود
export interface Column {
  key: string; 
  header: string; 
  render?: (row: AnyRec, rowIndex: number) => React.ReactNode; 
  width?: string; 
}

// نوع خصائص (Props) مُكوّن الجدول
export interface DataTableProps {
  title: string;
  data: AnyRec[];
  columns: Column[];
  headerAction?: React.ReactNode; 
  startIndex?: number; 

  // === خصائص الترقيم المضافة لإنهاء الخطأ ===
  page: number;
  onPageChange: (page: number) => void;
  totalRows: number;
  pageSize: number;
  // ==========================================
  viewHashTag ?: boolean
}


export default function TableTypes() {
 
}