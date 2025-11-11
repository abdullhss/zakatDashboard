import React, { useMemo, useState, useRef } from "react";
import {
  Box, HStack, useToast, Spinner, Alert, AlertIcon, Select, Text,
  Menu, MenuButton, MenuList, MenuItem, IconButton, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, FormControl, FormLabel, Input,
  Textarea, Checkbox, AspectRatio, Image, Icon, VStack
} from "@chakra-ui/react";
import { MdMoreVert, MdImage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import { useGetProjects } from "./hooks/useGetProjects";
import { useUpdateProject } from "./hooks/useUpdateProject";
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
import { HandelFile } from "../../../HandleFile.js";
import { getSession } from "../../../session";
import { buildProjectPhotoUrl } from "./helpers/photos.js";

const PAGE_SIZE = 10;

export default function Projects() {
  const [page, setPage] = useState(1);
  const [completeType, setCompleteType] = useState<"N" | "C" | "S">("S");

  // حالة المودال/التعديل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<AnyRec | null>(null);

  // حقول قابلة للتعديل
  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fWanted, setFWanted] = useState("");
  const [fRemaining, setFRemaining] = useState("");
  const [fAllowZakat, setFAllowZakat] = useState(true);
  const [fIsActive, setFIsActive] = useState(true);

  // صورة المشروع
  const [currentPhotoId, setCurrentPhotoId] = useState<string>("");
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toast = useToast();
  const navigate = useNavigate();

  const start = useMemo(() => (page - 1) * PAGE_SIZE, [page]);
  const { mutateAsync: updateProject, isPending: updateLoading } = useUpdateProject();
  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetProjects(completeType, start, PAGE_SIZE);

    
    const totalRows = Number(data?.summary.decrypted.data.Result[0].ProjectsCount)||1
  const rows = data?.rows || [];
  console.log(rows);
  
  const openFile = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewPhotoFile(e.target.files?.[0] || null);

  const handleEdit = (row: AnyRec) => {
    setEditRow(row);
    // تعبئة الحقول
    setFName(row.Name ?? row.ProjectName ?? "");
    setFDesc(row.Description ?? row.ProjectDesc ?? "");
    setFWanted(String(row.WantedAmount ?? row.ProjectWantedAmount ?? ""));
    setFRemaining(String(row.RemainingAmount ?? row.ProjectRemainingAmount ?? ""));
    setFAllowZakat(!!(row.AllowZakat ?? true));
    setFIsActive(!!(row.IsActive ?? true));
    // الـ ID للصورة (خانة PhotoName أو ProjectPhotoName)
    const pid = String(row.PhotoName ?? row.ProjectPhotoName ?? "");
    setCurrentPhotoId(pid);
    setNewPhotoFile(null);
    setIsEditOpen(true);
     navigate("/officedashboard/projects/add", {
    state: { project: row },   
  });
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditRow(null);
  };

  const onSubmitEdit = async () => {
    if (!editRow) return;

    try {
      // لو فيه صورة جديدة: ارفعها وخد الID
      let photoId = currentPhotoId || "";
      if (newPhotoFile) {
        const session = getSession();
        const sessionId =
          (session as any)?.SessionID ||
          (session as any)?.sessionId ||
          (session as any)?.token ||
          "";

        const hf = new HandelFile();
        const up = await hf.UploadFileWebSite({
          action: "Add",
          file: newPhotoFile,
          fileId: "",
          SessionID: sessionId,
          onProgress: (p: number) => console.log(`Project photo progress: ${p}%`),
        });
        console.log("Upload project photo (edit) =>", up);
        if (!up?.id || up.id === "0") {
          throw new Error(up?.error || "فشل رفع الصورة");
        }
        photoId = String(up.id);
      }

      const payload = {
        id: Number(editRow.Id ?? editRow.ProjectId ?? editRow.id),
        projectName: fName,
        projectDesc: fDesc,
        subventionTypeId: Number(editRow.SubventionType_Id ?? 0),
        wantedAmount: fWanted,
        openingBalance: String(editRow.OpeningBalance ?? editRow.ProjectOpeningBalance ?? 0),
        remainingAmount: fRemaining,
        allowZakat: !!fAllowZakat,
        importanceId: Number(editRow.Importance_Id ?? 0),
        isActive: !!fIsActive,
        photoName: photoId, // ← ده الID للصورة
      };

      const res = await updateProject(payload);
      if ((res as any)?.success === false) {
        throw new Error((res as any)?.error || "فشل التعديل");
      }

      toast({ status: "success", title: "تم تعديل المشروع بنجاح." });
      closeEdit();
      refetch?.();
    } catch (err: any) {
      toast({
        status: "error",
        title: "فشل التعديل",
        description: err?.message || "حدث خطأ أثناء تحديث المشروع.",
      });
    }
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: "Name",
        header: "اسم المشروع",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.800">
            {row.Name ?? row.ProjectName ?? "—"}
          </Text>
        ),
      },
      {
        key: "Description",
        header: "وصف المشروع",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.800">
            {row.Description ?? "—"}
          </Text>
        ),
      },
      {
        key: "SubventionTypeName",
        header: "نوع المشروع",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.800">
            {row.SubventionTypeName ?? "—"}
          </Text>
        ),
      },
      {
        key: "WantedAmount",
        header: "المبلغ المطلوب",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.800">
            {row.WantedAmount ?? row.ProjectWantedAmount ?? "—"}
          </Text>
        ),
      },
      {
        key: "RemainingAmount",
        header: "المبلغ المتبقي",
        render: (row: AnyRec) => (
          <Text fontWeight="600" color="gray.800">
            {row.RemainingAmount ?? row.ProjectRemainingAmount ?? "—"}
          </Text>
        ),
      },
      // {
      //   key: "Actions",
      //   header: "الخيارات",
      //   render: (row: AnyRec) => (
      //     <Menu>
      //       <MenuButton as={IconButton} icon={<MdMoreVert />} aria-label="More options" />
      //       <MenuList>
      //         <MenuItem onClick={() => handleEdit(row)}>تعديل</MenuItem>
      //       </MenuList>
      //     </Menu>
      //   ),
      // },
    ],
    []
  );

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
        حدث خطأ أثناء جلب المشاريع: {(error as Error)?.message}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <HStack mb={4} spacing={3}>
        <Select
          w="260px"
          px={3}
          value={completeType}
          onChange={(e) => setCompleteType(e.target.value as "N" | "C" | "S")}
        >
          <option value="S">مشاريع غير مكتملة</option>
          <option value="C">مشاريع مكتملة</option>
          <option value="N">مشاريع جديدة</option>
        </Select>
      </HStack>

      <DataTable
        title="قائمة المشاريع"
        data={rows}
        columns={columns}
        startIndex={start + 1}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        totalRows={totalRows}
        onEditRow={(row)=>{ handleEdit(row)}}
        headerAction={
          <SharedButton
            to="/officedashboard/projects/add"
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
            إضافة مشروع
          </SharedButton>
        }
      />

      {rows.length === 0 && !isLoading && (
        <Text mt={3} color="gray.500">
          لا توجد مشاريع.
        </Text>
      )}

      {/* Modal Edit */}
      <Modal isOpen={isEditOpen} onClose={closeEdit} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل المشروع</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <GridLike>
              <FormControl mb={3} isRequired>
                <FormLabel>اسم المشروع</FormLabel>
                <Input value={fName} onChange={(e) => setFName(e.target.value)} />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>وصف المشروع</FormLabel>
                <Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={4} />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>المبلغ المطلوب</FormLabel>
                <Input
                  type="number"
                  value={fWanted}
                  onChange={(e) => setFWanted(e.target.value)}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>المبلغ المتبقي</FormLabel>
                <Input
                  type="number"
                  value={fRemaining}
                  onChange={(e) => setFRemaining(e.target.value)}
                  // لو جاي من السيرفر غير صفري نخليه مقفول
                  disabled={
                    Number(editRow?.RemainingAmount ?? editRow?.ProjectRemainingAmount ?? 0) !== 0
                  }
                />
              </FormControl>

              <HStack mb={3} spacing={8}>
                <Checkbox
                  isChecked={fAllowZakat}
                  onChange={(e) => setFAllowZakat(e.target.checked)}
                >
                  يقبل الزكاة
                </Checkbox>
                <Checkbox
                  isChecked={fIsActive}
                  onChange={(e) => setFIsActive(e.target.checked)}
                >
                  نشط
                </Checkbox>
              </HStack>

              {/* صورة المشروع */}
              <FormControl>
                <FormLabel>صورة المشروع</FormLabel>
                <VStack align="start">
                  <AspectRatio
                    ratio={4 / 3}
                    w="100%"
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.50"
                    onClick={openFile}
                    cursor="pointer"
                  >
                    <Box>
                      {newPhotoFile ? (
                        <Image
                          src={URL.createObjectURL(newPhotoFile)}
                          alt="new"
                          objectFit="cover"
                          w="100%"
                          h="100%"
                        />
                      ) : currentPhotoId ? (
                        <Image
                          src={buildProjectPhotoUrl(currentPhotoId, ".jpg")}
                          alt="project"
                          objectFit="cover"
                          w="100%"
                          h="100%"
                          fallback={
                            <VStack h="100%" w="100%" align="center" justify="center">
                              <Icon as={MdImage} boxSize={10} color="gray.400" />
                              <Text>لا توجد صورة</Text>
                            </VStack>
                          }
                        />
                      ) : (
                        <VStack h="100%" w="100%" align="center" justify="center">
                          <Icon as={MdImage} boxSize={10} color="gray.400" />
                          <Text color="gray.500">اضغط لاختيار صورة</Text>
                        </VStack>
                      )}
                    </Box>
                  </AspectRatio>

                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                  {currentPhotoId && !newPhotoFile && (
                    <Text fontSize="xs" color="gray.500">
                      Image ID: {currentPhotoId}
                    </Text>
                  )}
                </VStack>
              </FormControl>
            </GridLike>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeEdit}>
              إلغاء
            </Button>
            <Button colorScheme="teal" onClick={onSubmitEdit} isLoading={updateLoading}>
              حفظ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

/* غلاف بسيط ليشبه Grid بدون استيراد Grid */
function GridLike({ children }: { children: React.ReactNode }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={4}
    >
      {children}
    </Box>
  );
}
