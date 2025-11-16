import { useMemo, useState, useEffect } from "react";
import {
  Box, Text, useToast,
  Flex, Spinner, Alert, AlertIcon, Switch,
} from "@chakra-ui/react";

import { DataTable } from "../../../Components/Table/DataTable";
import { doTransaction, executeProcedure } from "../../../api/apiClient";
import { getSession } from "../../../session";
import SharedButton from "../../../Components/SharedButton/Button";
import { AddIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

export default function CommonQuestions() {
  const toast = useToast();

  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState("");

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);

      const response = await executeProcedure(
        "UxawKQUXgs40Q01GJM90lP1to63mG/ZutDImpvXTVME=",
        `${page}#${limit}`
      );

      const total = Number(response.decrypted.data.Result[0].CommonQuestionsCount);
      const rows = JSON.parse(response.decrypted.data.Result[0].CommonQuestionsData);

      setTotalRows(total);
      setData(rows);
      setServerMessage(response.message || "");
    } catch (err) {
      toast({
        title: "خطأ أثناء تحميل الأسئلة",
        description: err.message,
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page]);

  const rows = useMemo(() => {
    return data.map((r) => ({
      Id: Number(r.Id),
      Question: r.Question ?? "—",
      Answer: r.Answer ?? "—",
      IsActive: Boolean(r.IsActive)
    }));
  }, [data]);

  /* ---------------- الأعمدة ---------------- */
  const columns = useMemo(
    () => [
      {
        key: "Question",
        header: "السؤال",
        render: (row) => <Text fontWeight="600">{row.Question}</Text>,
      },
      {
        key: "Answer",
        header: "الإجابة",
      },
      {
        key: "IsActive",
        header: "الحالة",
        render: (row) => (
            <span>
                {row.IsActive?"مفعل" : "غير مفعل"}
            </span>
        ),
      },
    ],
    []
  );

    const navigate = useNavigate();

    const handleGoToEdit = (row)=>{
        navigate(`/maindashboard/CommonQuestions/add?edit=${encodeURIComponent(JSON.stringify(row))}`)
    }
  /* ---------------- تحديث حالة التفعيل ---------------- */
  const toggleActive = async (row) => {
    const columnsNames = "Id#IsActive";
    const columnsValues = `${row.Id}#${row.IsActive ? "False" : "True"}`;

    const { userId } = getSession();
    const pointId = userId ?? 0;

    const exec = await doTransaction({
      TableName: "w8GZW8O/lAQVG6R99L1C/w==",
      WantedAction: 1,
      ColumnsValues: columnsValues,
      ColumnsNames: columnsNames,
      PointId: pointId,
    });

    console.log(exec);

    // refresh
    fetchQuestions();
  };

  if (isLoading) {
    return (
      <Flex justify="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      {serverMessage && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {serverMessage}
        </Alert>
      )}

      <DataTable
        title="الأسئلة الشائعة"
        data={rows}
        columns={columns}
        onPageChange={setPage}
        page={page}
        pageSize={limit}
        totalRows={totalRows}
        startIndex={offset + 1}
        headerAction={
            <SharedButton
                leftIcon={<AddIcon />}
                to="/maindashboard/CommonQuestions/add"
                isLoading={isLoading}
            >
                إضافة سؤال 
            </SharedButton>
        }
        onEditRow={(row)=>{handleGoToEdit(row)}}

                // renderActions={(row) => (
                // <RowActions
                //     row={row}
                //     onDeleted={() => refetch()}
                //     onEdited={(r) =>
                //     navigate(`/maindashboard/offices/add?edit=${r.id}`, {
                //         state: { mode: "edit", row: offciesData.find((o) => Number(o.Id ?? o.id) === r.id) },
                //     })
                //     }
                // />
                // )}      
                />
    </Box>
  );
}
