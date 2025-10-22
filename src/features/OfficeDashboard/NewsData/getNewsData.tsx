// src/features/OfficeDashboard/NewsData/getNewsData.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Spinner, Alert, AlertIcon, Text, HStack, Switch, Image, Link,
  Icon, Menu, MenuButton, MenuList, MenuItem, IconButton, Tooltip, useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../Components/Table/DataTable";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { useGetNewsData } from "./hooks/useGetDashNewsData";
import { useDeleteNewsData } from "./hooks/useDeleteNewsData";
import { getSession } from "../../../session";
import { FiMoreVertical, FiFileText, FiImage } from "react-icons/fi";
import SharedButton from "../../../Components/SharedButton/Button";

const PAGE_SIZE = 10;

// روابط عرض الملفات/الصور
const ZAKAT_IMAGES_BASE = "https://framework.md-license.com:8093/ZakatImages";
const ZAKAT_FILES_BASE  = "https://framework.md-license.com:8093/ZakatFiles";

const buildPhotoUrlByName = (name?: string | number, ext?: string) => {
  if (!name) return "";
  const normalized = ext && ext.startsWith(".") ? ext : ".jpg";
  return `${ZAKAT_IMAGES_BASE}/${name}${normalized}`;
};

const buildAttachmentUrlByName = (name?: string | number, ext?: string) => {
  if (!name) return "";
  const normalized = (ext && ext.startsWith(".")) ? ext.toLowerCase() : "";
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(normalized);
  const base = isImage ? ZAKAT_IMAGES_BASE : ZAKAT_FILES_BASE;
  const suffix = normalized || ".pdf";
  return `${base}/${name}${suffix}`;
};

function short(text: string, n = 100) {
  if (!text) return "—";
  return text.length > n ? text.slice(0, n) + "..." : text;
}

function parseDDMMYYYY(s?: string) {
  if (!s) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

// تطبيع باي بايلود مدمج
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

type MakeColsArgs = {
  startIndex: number;
  goToType: (id?: number | string) => void;
  onEdit: (row: AnyRec) => void;
  onDelete: (row: AnyRec) => void;
};

const makeColumns = ({ startIndex, goToType, onEdit, onDelete }: MakeColsArgs): Column[] => [
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
      const name: string | number | undefined = row.NewsMainPhotoName;
      const ext: string | undefined = row.NewsMainPhotoExt || row.AttachmentFileExt || ".jpg";
      const src = buildPhotoUrlByName(name, ext);
      return src ? (
        <Image
          src={src}
          alt={row.NewsMainTitle || "news"}
          boxSize="44px"
          objectFit="cover"
          borderRadius="md"
          fallback={<Icon as={FiImage} />}
          title={name ? `${name}${ext || ""}` : ""}
        />
      ) : (
        <Icon as={FiImage} title="لا توجد صورة" />
      );
    },
  },
  {
    key: "AttachmentFile",
    header: "المرفقات",
    width: "12%",
    render: (row: AnyRec) => {
      const name: string | number | undefined = row.AttachmentFile;
      const ext: string | undefined = row.AttachmentFileExt;
      if (!name) return <Text>—</Text>;
      const url = buildAttachmentUrlByName(name, ext);
      const isPdf = (ext ?? "").toLowerCase() === ".pdf";
      return (
        <HStack spacing={2}>
          <Icon as={isPdf ? FiFileText : FiImage} />
          <Link href={url} target="_blank" rel="noopener noreferrer">
            {`${name}${ext || ""}`}
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
      const raw = row.NewsPublishDate ?? row.NewsCreateDate;
      const d = parseDDMMYYYY(raw) || (raw ? new Date(raw) : null);
      return d ? d.toLocaleDateString("ar-EG") : (raw || "—");
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
          <MenuItem onClick={() => onEdit(row)}>تعديل</MenuItem>
          <MenuItem color="red.500" onClick={() => onDelete(row)}>
            حذف
          </MenuItem>
        </MenuList>
      </Menu>
    ),
  },
];

export default function GetNewsData() {
  const toast = useToast();
  const delNews = useDeleteNewsData();

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
        totalRows: Number((data as any).totalRows ?? (data as any).rows.length) || 0,
      };
    }
    return normalizeServerPayload(data, offset, limit);
  }, [data, offset, limit]);

  const navigate = useNavigate();

  const goToType = useCallback(
    (id?: number | string) =>
      navigate(`/officedashboard/news-types${id ? `?typeId=${id}` : ""}`),
    [navigate]
  );

  // ⬅️ أهم جزء: فتح نفس فورم الإضافة في وضع تعديل مع تمرير الصف كاملًا
  const onEdit = useCallback(
    (row: AnyRec) => {
      const id =
        row?.Id ?? row?.NewsId ?? row?.id ?? row?.ID ?? row?.News_Id ?? "";
      navigate(`/officedashboard/newsdata/add?edit=${id}`, {
        state: { row, mode: "edit" },
      });
    },
    [navigate]
  );

  useEffect(() => {
    if (!isLoading) {
      console.groupCollapsed("%c[News] parsed", "color:#06b6d4;font-weight:bold");
      console.log("rows:", rows);
      console.log("totalRows:", totalRows);
      console.log("raw payload:", data);
      console.groupEnd();
    }
  }, [data, rows, totalRows, isLoading]);

  const handleDelete = async (row: AnyRec) => {
    const id = (row as any)?.Id ?? (row as any)?.NewsId ?? (row as any)?.id;
    if (!id) {
      toast({
        status: "warning",
        title: "لا يمكن الحذف",
        description: "لم يتم العثور على رقم الخبر.",
      });
      return;
    }

    const sure = window.confirm(`هل أنت متأكد من حذف الخبر رقم ${id}؟`);
    if (!sure) return;

    try {
      await delNews.mutateAsync({ id });
      toast({ status: "success", title: "تم الحذف", description: `تم حذف الخبر رقم ${id}.` });
      // revalidate هنا حسب هوك الجلب عندك
    } catch (e: any) {
      toast({
        status: "error",
        title: "فشل الحذف",
        description: e?.message || "حدث خطأ غير متوقع",
      });
    }
  };

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
    () => makeColumns({ startIndex: offset + 1, goToType, onEdit, onDelete: handleDelete }),
    [offset, goToType, onEdit]
  );

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="800">الأخبار</Text>
        <SharedButton
          to="/officedashboard/newsdata/add"
          variant="brandGradient"
          leftIcon={
            <Box
              bg="white"
              color="brand.900"
              w="22px"
              h="22px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="700"
              lineHeight="1"
              fontSize="18px"
              borderRadius="md"
            >
              ＋
            </Box>
          }
        >
          إضافة خبر
        </SharedButton>
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
        <Text mt={3} color="gray.500">لا توجد أخبار متاحة حاليًا.</Text>
      )}
    </Box>
  );
}
