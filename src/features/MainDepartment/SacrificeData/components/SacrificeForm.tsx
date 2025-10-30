import React, { useMemo } from "react";
import FormModal, { type FieldConfig } from "../../../../Components/ModalAction/FormModel";

export type SacrificeFormValues = { name: string; price: number | string; isActive?: boolean };

export default function SacrificeForm(props: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: "add" | "edit";
  initialValues: SacrificeFormValues;
  onSubmit: (vals: SacrificeFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}) {
  const { isOpen, onClose, title, mode, initialValues, onSubmit, isSubmitting } = props;

  const fields: FieldConfig[] = useMemo(() => {
    if (mode === "add") {
      return [
        { name: "name", label: "اسم النوع", placeholder: "مثال: حري", required: true, inputProps: { dir: "rtl" } },
        { name: "price", label: "السعر", placeholder: "مثال: 9000", required: true, inputProps: { type: "number", inputMode: "numeric", min: 0 } },
        { name: "isActive", label: "مفعّل", type: "switch", colSpan: 2 },
      ];
    }
    return [
      { name: "name", label: "اسم النوع", required: true, inputProps: { dir: "rtl" } },
      { name: "price", label: "السعر", required: true, inputProps: { type: "number", inputMode: "numeric", min: 0 } },
      { name: "isActive", label: "مفعّل", type: "switch", colSpan: 2 }, // إضافة الـ Switch لحالة "مفعّل"
    ];
  }, [mode]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      fields={fields}
      initialValues={initialValues} // التأكد من تمرير القيمة هنا
      submitLabel={mode === "add" ? "إضافة" : "حفظ"}
      cancelLabel="إلغاء"
      isSubmitting={!!isSubmitting}
      onSubmit={onSubmit as any}
      maxW="600px"
    />
  );
}
