// src/features/MainDepartment/Users/AddUserPage.tsx
import React, { useRef } from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import UserForm from "./Components/UserForm";
import { useAddUser } from "./hooks/useAddUser";
import { useUpdateUser } from "./hooks/useUpdateUser";
import { useGetUserById } from "./hooks/useGetUserById";
import { getSession } from "../../../session";

export default function AddUserPage() {
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;

  const session = getSession();
  const isOfficeSession = session.role === "O";
  const sessionOfficeId = Number(session.officeId || 0);

  const { id } = useParams();
  const isEdit = !!id;
  const passedRow = location?.state?.row ?? null;

  const { row: fetchedRow, isLoading: isFetchingUser } = useGetUserById(isEdit ? id : undefined);
  const editRow = passedRow || fetchedRow || null;

  const { loading: adding, submit: submitAdd } = useAddUser();
  const { loading: updating, submit: submitUpdate } = useUpdateUser();
  const busy = adding || updating;

  return (
    <Box dir="rtl">
      <HStack justify="space-between" mb={4}>
        <Heading size="lg" fontWeight="700" color="gray.800">
          المستخدمين <span style={{ color: "#718096" }}> / </span> {isEdit ? "تعديل مستخدم" : "إضافة مستخدم"}
        </Heading>
      </HStack>

      <Box
        bg="background.surface"
        border="1px solid"
        borderColor="background.border"
        rounded="lg"
        p={{ base: 4, md: 6 }}
        boxShadow="sm"
      >
        <UserForm
          firstInputRef={firstInputRef}
          isEdit={isEdit}
          editRow={editRow}
          session={session}
          isOfficeSession={isOfficeSession}
          sessionOfficeId={sessionOfficeId}
          submitAdd={submitAdd}
          submitUpdate={submitUpdate}
          busy={busy}
          navigate={navigate}
        />
      </Box>
    </Box>
  );
}
