import React from "react";
import DataTable from "./Table/DataTable";

export function chunkArrayForPrint(items, size) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const n = Math.max(1, Number(size) || 1);
  const out = [];
  for (let i = 0; i < items.length; i += n) {
    out.push(items.slice(i, i + n));
  }
  return out;
}

/**
 * Print-only: one DataTable per pagination chunk, each chunk starts a new printed page
 * (except the first) so rows are not clipped at page boundaries.
 */
export function ChunkedPrintDataTables({ title, data, columns, chunkSize }) {
  const chunks = chunkArrayForPrint(data, chunkSize);

  return (
    <>
      {chunks.map((chunk, i) => (
        <div
          key={i}
          className={
            i > 0
              ? "print-survey-print-chunk print-survey-print-chunk--break"
              : "print-survey-print-chunk"
          }
        >
          <DataTable
            title={title}
            data={chunk}
            columns={columns}
            totalRows={chunk.length}
            startIndex={i * chunkSize + 1}
          />
        </div>
      ))}
    </>
  );
}
