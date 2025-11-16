import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { doTransaction } from "../../../api/apiClient";
import { getSession } from "../../../session";

export default function AddQuestion() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------- Check Edit Mode -------------------
  const editData = (() => {
    try {
      const params = new URLSearchParams(location.search);
      const value = params.get("edit");
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  })();

  const isEdit = Boolean(editData);

  // ------------------- Local State -------------------
  const [question, setQuestion] = useState(editData?.Question || "");
  const [answer, setAnswer] = useState(editData?.Answer || "");
  const [isActive, setIsActive] = useState(editData?.IsActive ?? true);

  // ------------------- Add Question -------------------
  const handleAdd = async () => {
    if (!question || !answer) {
      return toast({
        title: "يجب إدخال السؤال والإجابة",
        status: "warning",
      });
    }

    const { userId } = getSession();

    const response = await doTransaction({
      TableName: "0GxDk/ZfFvjIeBBzZXYsJA==",
      WantedAction: 0, // Insert
      ColumnsNames: "Id#Question#Answer#IsActive",
      ColumnsValues: `0#${question}#${answer}#${isActive}`,
      PointId: userId ?? 0,
    });

    toast({
      title: "تم إضافة السؤال بنجاح",
      status: "success",
    });

    navigate(-1);
  };

  // ------------------- Edit Question -------------------
  const handleEdit = async () => {
    if (!question || !answer) {
      return toast({
        title: "يجب إدخال السؤال والإجابة",
        status: "warning",
      });
    }

    const { userId } = getSession();

    const response = await doTransaction({
      TableName: "0GxDk/ZfFvjIeBBzZXYsJA==",
      WantedAction: 1, // Update
      ColumnsNames: "Id#Question#Answer#IsActive",
      ColumnsValues: `${editData.Id}#${question}#${answer}#${isActive}`,
      PointId: userId ?? 0,
    });

    toast({
      title: "تم تعديل السؤال بنجاح",
      status: "success",
    });

    navigate(-1);
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={6} shadow="lg" borderRadius="xl">
      <Heading size="lg" mb={5} textAlign="center">
        {isEdit ? "تعديل السؤال" : "إضافة سؤال جديد"}
      </Heading>

      <VStack spacing={4}>
        <FormControl>
          <FormLabel>السؤال</FormLabel>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="أدخل السؤال"
          />
        </FormControl>

        <FormControl>
          <FormLabel>الإجابة</FormLabel>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="أدخل الإجابة"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">مفعل</FormLabel>
          <Switch
            isChecked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </FormControl>

        <Button
          width="100%"
          colorScheme="teal"
          onClick={isEdit ? handleEdit : handleAdd}
        >
          {isEdit ? "حفظ التعديل" : "إضافة"}
        </Button>
      </VStack>
    </Box>
  );
}
