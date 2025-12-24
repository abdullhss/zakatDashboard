import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Textarea,
  Button,
  VStack,
  Spinner,
  Flex,
  useToast,
  Text,
} from "@chakra-ui/react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import { doTransaction, executeProcedure } from "../../../api/apiClient";
import { getSession } from "../../../session";
import Pagination from "../../../Components/Table/Pagination";

export default function UsersQuestions() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [questions, setQuestions] = useState([]);
  const [questionsMaxCount, setQuestionsMaxCount] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);

        const response = await executeProcedure(
          "N0ChknvX6yV9dlQ8l0KfTRSpfIQBcOjwDwfhD1bM25ueYyyNvTfLX8weTZbGgjol",
          `0#${((page - 1) * limit) + 1}#${limit}`
        );

        setQuestionsMaxCount(
          Number(response.decrypted.data.Result[0].GeneralUserQuestionsCount) || 1
        );

        const rows = JSON.parse(
          response.decrypted.data.Result[0].GeneralUserQuestionsData
        );

        setQuestions(rows);

        // initialize answers state
        const defaultAnswers = {};
        rows.forEach((q) => {
          defaultAnswers[q.Id] = q.Answer || "";
        });

        setAnswers(defaultAnswers);
      } catch (err) {
        toast({
          title: "خطأ أثناء تحميل البيانات",
          description: err.message,
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [page]);
  console.log(questions);
  
  if (isLoading)
    return (
      <Flex justify="center" mt={20}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box mx="10" mt={10}>
      <Accordion allowToggle>
        {questions.map((q) => (
          <AccordionItem
            key={q.Id}
            mb={4}
            borderRadius="lg"
            bg="white"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ boxShadow: "lg" }}
          >
            <h2>
              <AccordionButton
                bg="gray.50"
                _hover={{ bg: "gray.100" }}
                py={4}
                borderRadius="lg"
              >
                <Box
                  as="span"
                  flex="1"
                  textAlign="left"
                  fontWeight="600"
                  fontSize="lg"
                  color="gray.700"
                >
                  {q.Question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>

            <AccordionPanel pb={5} bg="gray.50">
              <VStack align="stretch" spacing={3}>
                <Text>
                  الإجابة: {q.Answer}
                </Text>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {/* ---------- Pagination ---------- */}
      <Flex justify="center" mt={6}>
        <Pagination
          page={page}
          pageSize={limit}
          totalRows={questionsMaxCount}
          onPageChange={setPage}
        />
      </Flex>
    </Box>
  );
}
