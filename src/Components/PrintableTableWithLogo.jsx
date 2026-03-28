import React, { useState } from "react";
import { Button } from "@chakra-ui/react";

const LOGO_SRC = "/assets/Logo.png";

const SURVEY_PRINT_PAGE_STYLE_ID = "print-survey-full-paper-width";
const PRINT_FULL_BLEED_HTML_CLASS = "print-survey-full-bleed";

function injectSurveyPrintPageMargins() {
  let el = document.getElementById(SURVEY_PRINT_PAGE_STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = SURVEY_PRINT_PAGE_STYLE_ID;
    document.head.appendChild(el);
  }
  /* يُحمَّل قبل الطباعة فيُطبَّق بعد index.css — هامش جانبي 0 لأقصى عرض */
  el.textContent = `@media print {
    @page {
      margin-top: 10mm !important;
      margin-bottom: 12mm !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    html, body {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #printable-table.printable-with-logo {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #printable-table.printable-with-logo table.print-survey-frame {
      width: 100% !important;
      max-width: none !important;
      table-layout: fixed !important;
    }
    #printable-table.printable-with-logo .print-survey-logo-thead td,
    #printable-table.printable-with-logo .print-survey-main-cell {
      width: 100% !important;
    }
    #printable-table.printable-with-logo .print-table-main,
    #printable-table.printable-with-logo .printable-table-print-only,
    #printable-table.printable-with-logo .print-survey-print-chunk {
      width: 100% !important;
      max-width: none !important;
    }
    #printable-table.printable-with-logo .print-table-main > [class*="css-"],
    #printable-table.printable-with-logo .print-survey-print-chunk > [class*="css-"] {
      width: 100% !important;
      max-width: none !important;
      margin-inline: 0 !important;
      padding: 10px 6mm 12px 6mm !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      border: 1px solid #bbb !important;
      background: #fff !important;
    }
    #printable-table.printable-with-logo .print-table-main > [class*="css-"] > div {
      width: 100% !important;
      max-width: none !important;
    }
    #printable-table.printable-with-logo table {
      width: 100% !important;
      max-width: none !important;
      table-layout: fixed !important;
    }
  }`;
}

function removeSurveyPrintPageMargins() {
  document.getElementById(SURVEY_PRINT_PAGE_STYLE_ID)?.remove();
}

/**
 * Print: outer &lt;thead&gt; (شعار + عنوان) يتكرر على كل صفحة مطبوعة.
 * المحتوى (بما فيه ChunkedPrintDataTables) داخل tbody حتى لا يُقصّ أول صف تحت ترويسة ثابتة.
 */
export function PrintableTableWithLogo({
  documentTitle,
  hasData,
  children,
  preparePrint,
  printContent,
  onAfterPrint,
}) {
  const [isPreparing, setIsPreparing] = useState(false);
  const usesSplitPrint = typeof preparePrint === "function";

  const handlePrint = async () => {
    if (isPreparing) return;
    setIsPreparing(true);
    try {
      if (preparePrint) {
        await preparePrint();
      }

      injectSurveyPrintPageMargins();
      document.documentElement.classList.add(PRINT_FULL_BLEED_HTML_CLASS);

      const cleanup = () => {
        document.documentElement.classList.remove(PRINT_FULL_BLEED_HTML_CLASS);
        removeSurveyPrintPageMargins();
        onAfterPrint?.();
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);

      window.print();
    } finally {
      setIsPreparing(false);
    }
  };

  const main = usesSplitPrint ? (
    <>
      <div className="printable-table-screen-only">{children}</div>
      <div className="printable-table-print-only">{printContent}</div>
    </>
  ) : (
    children
  );

  return (
    <>
      {hasData ? (
        <>
          <div id="printable-table" className="printable-with-logo">
            <table className="print-survey-frame">
              <thead className="print-survey-logo-thead">
                <tr>
                  <td>
                    <div className="print-survey-print-head">
                      <img
                        src={LOGO_SRC}
                        alt=""
                        className="print-table-logo-img"
                      />
                      {documentTitle ? (
                        <div className="print-table-doc-title">
                          {documentTitle}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="print-survey-main-cell">
                    <div className="print-table-main">{main}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button
            mt={4}
            w="full"
            onClick={handlePrint}
            isLoading={isPreparing}
            loadingText="جاري التحميل..."
            isDisabled={isPreparing}
          >
            طباعة
          </Button>
        </>
      ) : (
        children
      )}
    </>
  );
}
