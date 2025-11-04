// ActionButtons.tsx — نسخة محسّنة الشكل فقط
import React from "react";
import { Box, HStack } from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import type { AnyRec } from "../Table/TableTypes"; // عدّل المسار لو لزم

const GREEN = "#237000";
const RED = "#FF0000";

const outerBase: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease",
};

const innerBase: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function RawActionButtons({
  row,
  onApprove,
  onReject,
  disabled,
}: {
  row: AnyRec;
  onApprove: (row: AnyRec) => void;
  onReject: (row: AnyRec) => void;
  disabled?: boolean;
}) {
  return (
    <HStack spacing="12px">
      {/* ✅ زر الموافقة */}
      <Box
        style={{
          ...outerBase,
          background: `linear-gradient(145deg, ${GREEN}, #2E8B00)`,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
        _hover={{
          transform: disabled ? "none" : "scale(1.07)",
          boxShadow: disabled
            ? outerBase.boxShadow
            : "0 3px 10px rgba(35,112,0,0.4)",
        }}
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          onApprove(row);
        }}
        title="موافقة"
      >
        <Box style={innerBase}>
          <FaCheck color={"#FFF"} size={14} />
        </Box>
      </Box>

      {/* ❌ زر الرفض */}
      <Box
        style={{
          ...outerBase,
          background: `linear-gradient(145deg, ${RED}, #CC0000)`,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
        _hover={{
          transform: disabled ? "none" : "scale(1.07)",
          boxShadow: disabled
            ? outerBase.boxShadow
            : "0 3px 10px rgba(255,0,0,0.4)",
        }}
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          onReject(row);
        }}
        title="رفض"
      >
        <Box style={innerBase}>
          <FaTimes color={"#FFF"} size={14} />
        </Box>
      </Box>
    </HStack>
  );
}

export default React.memo(RawActionButtons);
