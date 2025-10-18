// src/features/MainDepartment/News/NewsData.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  HStack,
  Switch,
  Image,
  Link,
  Icon,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetNewsData } from "./hooks/useGetDashNewsData";
import { getSession } from "../../../session";
import { FiMoreVertical, FiFileText, FiImage } from "react-icons/fi";

const PAGE_SIZE = 10;

// ====== إعدادات مسارات الملفات (عدّلها حسب السيرفر) ======
const FILES_BASE = (import.meta as any)?.env?.VITE_FILES_BASE ?? "";
// مثال: VITE_FILES_BASE=https://rdtfhjguho8.american-softwares.com/storage

function buildPhotoUrl(name?: string | number, ext?: string) {
  if (!name) return "";
  const folder = "news_images"; // عدّلها لو مختلف
  const suffix = ext || ".jpg";
  return `${FILES_BASE}/${folder}/${name}${suffix}`;
}

function buildAttachmentUrl(name?: string | number, ext?: string) {
  if (!name) return "";
  const folder = "news_attachments"; // عدّل حسب الباك إند
  const suffix = ext || ".pdf";
  return `${FILES_BASE}/${folder}/${name}${suffix}`;
}

function short(text: string, n = 100) {
  if (!text) return "—";
  return text.length > n ? text.slice(0, n) + "..." : text;
}

// --------- فكّ استجابة السيرفر إلى rows/totalRows ----------
function normalizeServerPayload(payload: any, offset: number, limit: number) {
  const root = payload?.data ?? payload;
  const bucket = root?.Result?.[0];
  let parsed: AnyRec[] = [];
  try {
    if (bucket?.NewsData) parsed = JSON.parse(bucket.NewsData);
  } catch {
    parsed = [];
  }
  const totalRows = Number(bucket?.NewsCount ?? parsed.length) || parsed.length;
  const rows = parsed.slice(offset, offset + limit);
  return { rows, totalRows };
}

/* =========================
   الأعمدة (Columns)
   ========================= */
const makeColumns = (
  startIndex: number,
  goToType: (id?: number | string) => void,
  openTypesPage: () => void
): Column[] => [
  {
    key: "#",
    header: "#",
    width: "6%",
    render: (_row: AnyRec, idx: number) => (
      <Text fontWeight="600">{startIndex + idx}</Text>
    ),
  },
  {
    key: "NewsMainTitle",
    header: "العنوان الرئيسي",
    width: "20%",
    render: (row: AnyRec) => (
      <Text fontWeight="700" color="gray.800">
        {row.NewsMainTitle ?? "—"}
      </Text>
    ),
  },
  {
    key: "NewsContents",
    header: "نص الخبر",
    width: "22%",
    render: (row: AnyRec) => (
      <Text color="gray.700">{short(row.NewsContents ?? "—", 80)}</Text>
    ),
  },
  {
    key: "NewsMainPhotoName",
    header: "صورة الخبر",
    width: "10%",
    render: (row: AnyRec) => {
      const src = buildPhotoUrl(
        row.NewsMainPhotoName,
        row.AttachmentFileExt === ".jpg" ? ".jpg" : ".jpg"
      );
      return src ? (
        <Image
          src={src}
          alt={row.NewsMainTitle || "news"}
          boxSize="44px"
          objectFit="cover"
          borderRadius="md"
          fallback={<Icon as={FiImage} />}
        />
      ) : (
        <Icon as={FiImage} />
      );
    },
  },
  {
    key: "AttachmentFile",
    header: "المرفقات",
    width: "10%",
    render: (row: AnyRec) => {
      const isPdf = (row.AttachmentFileExt ?? "").toLowerCase() === ".pdf";
      const url = buildAttachmentUrl(row.AttachmentFile, row.AttachmentFileExt);
      if (!row.AttachmentFile) return <Text>—</Text>;
      return (
        <HStack spacing={2}>
          <Icon as={isPdf ? FiFileText : FiImage} />
          <Link href={url} target="_blank" rel="noopener noreferrer">
            ملف{row.AttachmentFileExt || ""}
          </Link>
        </HStack>
      );
    },
  },
{
  key: "NewsTypeName",
  header: "نوع الخبر",
  width: "10%",
  render: (row: AnyRec) => (
    <Text
      as="button"
      color="blue.600"
      _hover={{ textDecoration: "underline", color: "blue.800" }}
      onClick={() => goToType(row?.NewsType_Id)}
      title="اضغط لعرض تفاصيل هذا النوع"
    >
      {row.NewsTypeName ?? "—"}
    </Text>
  ),
},
  {
    key: "NewsPublishDate",
    header: "تاريخ النشر",
    width: "12%",
    render: (row: AnyRec) => {
      const dateStr = row.NewsPublishDate ?? row.NewsCreateDate;
      return dateStr ? new Date(dateStr).toLocaleDateString("ar-EG") : "—";
    },
  },
  {
    key: "IsActive",
    header: "الحالة",
    width: "7%",
    render: (row: AnyRec) => (
      <HStack>
        <Switch isChecked={!!row.IsActive} isReadOnly />
        <Text fontSize="sm">{row.IsActive ? "مفعل" : "غير مفعل"}</Text>
      </HStack>
    ),
  },
  {
    key: "Actions",
    header: "",
    width: "3%",
    render: (row: AnyRec) => (
      <Menu>
        <Tooltip label="إجراءات">
          <MenuButton
            as={IconButton}
            size="sm"
            aria-label="actions"
            icon={<FiMoreVertical />}
            variant="ghost"
          />
        </Tooltip>
        <MenuList>
          <MenuItem onClick={() => console.log("عرض", row)}>عرض</MenuItem>
          <MenuItem onClick={() => console.log("تعديل", row)}>تعديل</MenuItem>
          <MenuItem color="red.500" onClick={() => console.log("حذف", row)}>
            حذف
          </MenuItem>
        </MenuList>
      </Menu>
    ),
  },
];

/* =========================
   المكوّن
   ========================= */
export default function GetNewsData() {
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const { officeId } = getSession();
  const officeIdForAPI = officeId ?? 0;

  const { data, isLoading, isError, error, isFetching } = useGetNewsData(
    officeIdForAPI,
    offset,
    limit
  );

  const { rows, totalRows } = useMemo(() => {
    if (!data) return { rows: [], totalRows: 0 };
    if (Array.isArray((data as any).rows)) {
      return {
        rows: (data as any).rows as AnyRec[],
        totalRows:
          Number((data as any).totalRows ?? (data as any).rows.length) || 0,
      };
    }
    return normalizeServerPayload(data, offset, limit);
  }, [data, offset, limit]);

  // تنقّل
  const navigate = useNavigate();
  const goToType = (id?: number | string) =>
    navigate(`/officedashboard/news-types${id ? `?typeId=${id}` : ""}`);
  const openTypesPage = () => navigate(`/officedashboard/news-types`);

  // لوج
  useEffect(() => {
    if (!isLoading) {
      console.groupCollapsed(
        "%c[News] parsed",
        "color:#06b6d4;font-weight:bold"
      );
      console.log("rows:", rows);
      console.log("totalRows:", totalRows);
      console.log("raw payload:", data);
      console.groupEnd();
    }
  }, [data, rows, totalRows, isLoading]);

  if (isLoading && !isFetching) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error" m={6}>
        <AlertIcon />
        حدث خطأ أثناء جلب الأخبار: {(error as Error)?.message}
      </Alert>
    );
  }

  const columns = useMemo(
    () => makeColumns(offset + 1, goToType, openTypesPage),
    [offset]
  );

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="800">
          الأخبار
        </Text>
      </HStack>

      <DataTable
        title=""
        data={rows as AnyRec[]}
        columns={columns}
        startIndex={offset + 1}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        totalRows={totalRows}
      />

      {rows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">
          لا توجد أخبار متاحة حاليًا.
        </Text>
      )}
    </Box>
  );
}
