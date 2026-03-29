import { HStack, IconButton, Button, Text, Box } from "@chakra-ui/react";
import {
  FiChevronRight,
  FiChevronLeft,
  FiChevronsRight,
  FiChevronsLeft,
} from "react-icons/fi";

type Props = {
  page: number; // 1-based
  pageSize: number;
  totalRows: number;
  onPageChange: (p: number) => void;
  maxVisible?: number; // كم زر رقم في النافذة الوسطى عند وجود صفحات كثيرة (افتراضي 5)
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

type PageItem = number | "ellipsis";

/**
 * يبني قائمة أرقام الصفحات مع 1 ... وسط ... آخر عندما يتجاوز العدد maxVisible+2
 */
function buildPageItems(
  current: number,
  totalPages: number,
  maxVisible: number
): PageItem[] {
  if (totalPages <= 1) return [1];

  // إذا كان العدد صغيراً نعرض كل الصفحات دون نقاط
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [];
  const half = Math.floor(maxVisible / 2);

  // نافذة حول الصفحة الحالية داخل [2 .. totalPages-1] لتجنب تكرار 1 والأخيرة
  let start = Math.max(2, current - half);
  let end = Math.min(totalPages - 1, current + half);

  // ضبط طول النافذة إلى maxVisible كحد أقصى
  if (end - start + 1 > maxVisible) {
    end = start + maxVisible - 1;
  }
  if (end - start + 1 < maxVisible) {
    start = Math.max(2, end - maxVisible + 1);
  }

  // قرب البداية: اعرض 1 ثم 2..حتى تملأ النافذة
  if (current <= half + 1) {
    start = 2;
    end = Math.min(totalPages - 1, maxVisible);
  }
  // قرب النهاية
  if (current >= totalPages - half) {
    end = totalPages - 1;
    start = Math.max(2, totalPages - maxVisible);
  }

  items.push(1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let p = start; p <= end; p++) {
    items.push(p);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

export default function Pagination({
  page,
  pageSize,
  totalRows,
  onPageChange,
  maxVisible = 5,
}: Props) {
  const totalPages = Math.max(
    1,
    Math.ceil((totalRows || 0) / Math.max(1, pageSize))
  );
  const current = clamp(page || 1, 1, totalPages);

  const pageItems = buildPageItems(current, totalPages, maxVisible);

  const go = (p: number) => onPageChange(clamp(p, 1, totalPages));

  const showJumpShortcuts = totalPages > maxVisible + 2;

  return (
    <HStack spacing={1} flexWrap="wrap" align="center">
      {/* أول صفحة */}
      <IconButton
        aria-label="أول صفحة"
        icon={<FiChevronsRight />}
        size="sm"
        variant="ghost"
        isDisabled={current <= 1}
        onClick={() => go(1)}
        title="أول صفحة"
      />

      {/* السابق (RTL: سهم لليمين) */}
      <IconButton
        aria-label="السابق"
        icon={<FiChevronRight />}
        size="sm"
        variant="ghost"
        isDisabled={current <= 1}
        onClick={() => go(current - 1)}
      />

      {pageItems.map((item, idx) =>
        item === "ellipsis" ? (
          <Box
            key={`e-${idx}`}
            as="span"
            px={1}
            minW="28px"
            textAlign="center"
            userSelect="none"
            color="gray.500"
            fontWeight="700"
            fontSize="sm"
            aria-hidden
          >
            …
          </Box>
        ) : (
          <Button
            key={item}
            size="sm"
            w="32px"
            h="32px"
            minW="32px"
            p={0}
            rounded="md"
            fontWeight="700"
            fontSize="sm"
            variant={item === current ? "solid" : "ghost"}
            bg={item === current ? "side.a" : "transparent"}
            color={item === current ? "white" : "gray.700"}
            _hover={
              item === current
                ? { bg: "side.b" }
                : { bg: "blackAlpha.50" }
            }
            onClick={() => go(item)}
            aria-label={`صفحة ${item}`}
            aria-current={item === current ? "page" : undefined}
          >
            {item}
          </Button>
        )
      )}

      {/* التالي (RTL: سهم لليسار) */}
      <IconButton
        aria-label="التالي"
        icon={<FiChevronLeft />}
        size="sm"
        variant="ghost"
        isDisabled={current >= totalPages}
        onClick={() => go(current + 1)}
      />

      {/* آخر صفحة */}
      <IconButton
        aria-label="آخر صفحة"
        icon={<FiChevronsLeft />}
        size="sm"
        variant="ghost"
        isDisabled={current >= totalPages}
        onClick={() => go(totalPages)}
        title="آخر صفحة"
      />

      {showJumpShortcuts && totalPages > 1 && (
        <Text
          as="span"
          fontSize="xs"
          color="gray.500"
          ms={2}
          whiteSpace="nowrap"
        >
          {current} / {totalPages}
        </Text>
      )}
    </HStack>
  );
}
