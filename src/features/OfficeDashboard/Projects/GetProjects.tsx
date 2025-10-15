import React, { useMemo, useState, useCallback } from "react";
import { Box, HStack, useToast, Spinner, Alert, AlertIcon, Select, Text, Menu, MenuButton, MenuList, MenuItem, IconButton, Flex } from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md"; 
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../Components/Table/DataTable";
import SharedButton from "../../../Components/SharedButton/Button";
import FormModal from "../../../Components/ModalAction/FormModel";
import { useGetProjects } from "./hooks/useGetProjects";
import { useUpdateProject } from "./hooks/useUpdateProject"; 
import type { AnyRec, Column } from "../../../Components/Table/TableTypes";
// ===============================

const PAGE_SIZE = 10;

export default function Projects() {
  const [page, setPage] = useState(1);
  const [completeType, setCompleteType] = useState<"N" | "C" | "S">("N");
  const [selectedProject, setSelectedProject] = useState<AnyRec | null>(null); 
  const toast = useToast();
  const navigate = useNavigate();

  const start = useMemo(() => (page - 1) * PAGE_SIZE, [page]);

  const { mutateAsync: handleUpdateProject, isPending: updateLoading } = useUpdateProject(); 

  const { data, isLoading, isError, error, isFetching, refetch } = useGetProjects(completeType, start, PAGE_SIZE);

  const rows = data?.rows ?? [];
  const totalRows = data?.total ?? rows.length;

  const handleEdit = (row: AnyRec) => {
    setSelectedProject(row); 
  };

  const handleCloseModal = () => {
    setSelectedProject(null); // إغلاق الـ Modal
  };

  const handleUpdateSubmit = async (values: AnyRec) => {
    try {
        const payload = {
            id: Number(values.Id), 
            projectName: values.Name ?? values.ProjectName,
            projectDesc: values.Description,
            subventionTypeId: Number(values.SubventionType_Id),
            wantedAmount: String(values.WantedAmount),
            openingBalance: String(values.OpeningBalance),
            remainingAmount: String(values.RemainingAmount),
            allowZakat: !!values.AllowZakat, // boolean
            importanceId: Number(values.Importance_Id),
            isActive: !!values.IsActive, // boolean
            photoName: values.PhotoName || "",
        };
      const response = await handleUpdateProject(payload); 

      if (response.success) {
        toast({ status: "success", title: "تم تعديل المشروع بنجاح." });
        handleCloseModal();
      } else {
        toast({ status: "error", title: "فشل التعديل", description: response.error });
      }
    } catch (err: any) {
      toast({ status: "error", title: "فشل التعديل", description: err.message || "حدث خطأ أثناء تحديث المشروع." });
    }
  };

  const columns = useMemo(() => [
    {
      key: "Name", header: "اسم المشروع", render: (row: AnyRec) => (
        <Text fontWeight="600" color="gray.800">{row.Name ?? row.ProjectName ?? "—"}</Text>
      ),
    },
    {
      key: "WantedAmount", header: "المبلغ المطلوب", render: (row: AnyRec) => (
        <Text fontWeight="600" color="gray.800">{row.WantedAmount ?? "—"}</Text>
      ),
    },
    {
      key: "RemainingAmount", header: "المبلغ المتبقي", render: (row: AnyRec) => (
        <Text fontWeight="600" color="gray.800">{row.RemainingAmount ?? "—"}</Text>
      ),
    },
    {
      key: "Actions", header: "الخيارات", render: (row: AnyRec) => (
        <Menu>
          <MenuButton as={IconButton} icon={<MdMoreVert />} aria-label="More options" />
          <MenuList>
            <MenuItem onClick={() => handleEdit(row)}>تعديل</MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ], []);

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
          value={completeType}
          onChange={(e) => setCompleteType(e.target.value as "N" | "C" | "S")}
        >
          <option value="N">مشاريع جديدة</option>
          <option value="C">مشاريع مكتملة</option>
          <option value="S">مشاريع غير مكتملة</option>
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
        headerAction={
          <SharedButton
            to="/officedashboard/projects/add"
            variant="brandGradient"
            leftIcon={<Box bg="white" color="brand.900" w="22px" h="22px" display="flex" alignItems="center" justifyContent="center" fontWeight="700" lineHeight="1" fontSize="18px" borderRadius="md">＋</Box>}
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

      {selectedProject && (
        <FormModal
          isOpen={!!selectedProject}
          onClose={handleCloseModal}
          title="تعديل المشروع"
          initialValues={selectedProject}
          onSubmit={handleUpdateSubmit} 
          isSubmitting={updateLoading}
          fields={[
                // === الحقول الظاهرة ===
            { name: "Name", label: "اسم المشروع", type: "input", required: true },
            { name: "Description", label: "وصف المشروع", type: "textarea" },
            { name: "WantedAmount", label: "المبلغ المطلوب", type: "input", inputProps: { type: 'number' } },
            { name: "RemainingAmount", label: "المبلغ المتبقي", type: "input", inputProps: { type: 'number', disabled: selectedProject?.RemainingAmount !== 0 } },
                
              
                { name: "Id", type: "hidden" },
                { name: "ProjectName", type: "hidden" }, 
                { name: "SubventionType_Id", type: "hidden" },
                { name: "OpeningBalance", type: "hidden" },
                { name: "AllowZakat", type: "hidden" },
                { name: "Importance_Id", type: "hidden" },
                { name: "IsActive", type: "hidden" },
                { name: "PhotoName", type: "hidden" },
          ]}
        />
      )}
    </Box>
  );
}