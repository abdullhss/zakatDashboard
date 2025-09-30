import { HStack, IconButton, Button } from "@chakra-ui/react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

type Props = {
  page: number;                 // 1-based
  pageSize: number;
  totalRows: number;
  onPageChange: (p: number) => void;
  maxVisible?: number;          // كم زرار رقم يبان (افتراضي 5)
};

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export default function Pagination({
  page,
  pageSize,
  totalRows,
  onPageChange,
  maxVisible = 5,
}: Props) {
  const totalPages = Math.max(1, Math.ceil((totalRows || 0) / Math.max(1, pageSize)));
  const current = clamp(page || 1, 1, totalPages);

  // احسب نافذة الأرقام (زي فيجما: 5 أزرار حد أقصى)
  const half = Math.floor(maxVisible / 2);
  let start = current - half;
  let end = current + half;
  if (start < 1) { end += 1 - start; start = 1; }
  if (end > totalPages) { start -= (end - totalPages); end = totalPages; }
  start = Math.max(1, start);

  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const go = (p: number) => onPageChange(clamp(p, 1, totalPages));

  return (
    <HStack spacing={2}>
      {/* السابق (RTL: سهم لليمين) */}
      <IconButton
        aria-label="السابق"
        icon={<FiChevronRight />}       // RTL
        size="sm"
        variant="ghost"
        isDisabled={current <= 1}
        onClick={() => go(current - 1)}
      />

      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          w="30px"
          h="30px"
          minW="30px"
          p={0}
          rounded="md"
          fontWeight="700"
          variant={p === current ? "solid" : "ghost"}
          bg={p === current ? "side.a" : "transparent"}
          color={p === current ? "white" : "gray.700"}
          _hover={p === current ? { bg: "side.b" } : { bg: "blackAlpha.50" }}
          onClick={() => go(p)}
        >
          {p}
        </Button>
      ))}

      {/* التالي (RTL: سهم لليسار) */}
      <IconButton
        aria-label="التالي"
        icon={<FiChevronLeft />}        // RTL
        size="sm"
        variant="ghost"
        isDisabled={current >= totalPages}
        onClick={() => go(current + 1)}
      />
    </HStack>
  );
}
