// ActionButtons.tsx — نفس الاستايل القديم تمامًا
import React from "react";
import { Box, HStack } from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import type { AnyRec } from "../Table/TableTypes"; // عدّل المسار لو لزم

const GREEN = "#237000";
const RED = "#FF0000";

const outerBase: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
};

const innerBase: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 6,
  background: "#fff",
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
    <HStack spacing="10px">
      <Box
        style={{
          ...outerBase,
          background: GREEN,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          onApprove(row);
        }}
        title="موافقة"
      >
        <Box style={innerBase}>
          <FaCheck color={GREEN} />
        </Box>
      </Box>

      <Box
        style={{
          ...outerBase,
          background: RED,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          onReject(row);
        }}
        title="رفض"
      >
        <Box style={innerBase}>
          <FaTimes color={RED} />
        </Box>
      </Box>
    </HStack>
  );
}

export default React.memo(RawActionButtons);
